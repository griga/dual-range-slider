/**
 *
 * model should look like
 * {
 *  min: 10,
 *  max: 100
 * }
 *
 *
 *
 * @returns {{restrict: string, require: require}}
 */

(function () {
  "use strict";


  const dualRangeSlider = function ($filter) {
    let widgetsCounter = 0;

    return {
      replace: true,
      restrict: 'E',
      scope: {
        min: '=',
        max: '=',
        model: '=',
        step: '=',
        extended: '=',
        showLabels: '=',
        labelFilter: '@'

      },
      template: `
            <div class="dual-range-slider" id="{{::trsWidgetName}}" 
            ng-class="{'dual-range-slider--show-labels': showLabels}">
                <div class="dual-range-slider__label-row" ng-if="showLabels">
                  <div class="dual-range-slider__left-label">{{leftLabel}}</div>
                  <div class="dual-range-slider__right-label">{{rightLabel}}</div>
                </div>  
                <div class="dual-range-slider__input-row">
                  <input type="range" multiple ng-model="sliderValue" ng-mousedown="onStart($event)"
                   ng-mouseup="onEnd($event)" ng-change="onSliderChange()"
                  min="{{min}}" max="{{max}}" step="{{step}}" class="dual-range-slider__input">
                    <div class="dual-range-slider__left-thumb" ng-class="{drs_active: leftActive}"></div>
                    <div class="dual-range-slider__right-thumb" ng-class="{drs_active: rightActive}"></div>
                    <div class="dual-range-slider__highlight"></div>
                    <div class="dual-range-slider__track"></div>
                </div>
            </div>
            
        `,


      link: (scope, element, attributes)=> {

        validateModel(scope.model);

        widgetsCounter++;
        scope.sliderValue = 0;
        scope.trsWidgetName = 'dual-range-slider-widget-' + widgetsCounter;

        // elements cache
        const widget = element[0];

        const input = widget.querySelector('.dual-range-slider__input');
        const leftThumb = widget.querySelector('.dual-range-slider__left-thumb');
        const rightThumb = widget.querySelector('.dual-range-slider__right-thumb');
        const highlight = widget.querySelector('.dual-range-slider__highlight');

        let boundMin = scope.min;
        let boundMax = scope.max;

        let min = scope.model.min;
        let max = scope.model.max;


        angular.extend(scope.model, {
          min: boundMin <= min && min <= boundMax ? min : boundMin,
          max: boundMin <= max && max <= boundMax ? max : boundMax
        });


        scope.sliderValue = max;

        scope.$applyAsync(()=>{
          renderThumbs();
          setLabels()
        });


        function renderThumbs() {
          let low = scope.model.min;
          let up = scope.model.max;
          let width = widget.offsetWidth;

          let lpos = ( (low - boundMin) * width / (boundMax - boundMin)  );
          let rpos = ( (up - boundMin) * width / (boundMax - boundMin) );

          let thumbWidth = leftThumb.offsetWidth;

          let lOffs = Math.round(lpos - (lpos / width - .5) * thumbWidth);
          let rOffs = Math.round(rpos - (rpos / width - .5) * thumbWidth);

          leftThumb.style.left = lOffs + 'px';
          rightThumb.style.left = rOffs + 'px';

          highlight.style.left = lOffs + 'px';
          highlight.style.width = (rOffs - lOffs) + 'px';
        }

        function validateModel(model) {
          if (!model || !model.min || !model.max) {
            throw new Error(`Dual range slider error! Not valid modelis passed:     ${model}
                
                Example:  vm.hoursRange = {
                              min: 4,
                              max: 8
                          }
                          
                <dual-range-slider model="vm.hoursRange" min="0" max="24" ></dual-range-slider>`)
          }
        }

        function setLabels() {
          if (!scope.labelFilter) {
            scope.leftLabel = scope.model.min;
            scope.rightLabel = scope.model.max
          } else {
            scope.leftLabel = $filter(scope.labelFilter)(scope.model.min);
            scope.rightLabel = $filter(scope.labelFilter)(scope.model.max)
          }
        }

        scope.onSliderChange = ()=> {
          let val = parseInt(scope.sliderValue);

          let l = Math.abs(val - scope.model.min);
          let u = Math.abs(val - scope.model.max);

          if (l < u) {  // left is active
            angular.extend(scope.model, {
              min: val
            });
            scope.leftActive = true

          } else {
            angular.extend(scope.model, {
              max: val
            });
            scope.leftActive = false
          }

          scope.rightActive = !scope.leftActive;
          renderThumbs();
          setLabels();
        };

        scope.onStart = (e)=> {
          let offs = e.pageX - widget.offsetLeft;
          let thumbWidth = leftThumb.offsetWidth;
          let width = widget.offsetWidth;


          let val = ((offs + ((offs / width - 1 / 2) * thumbWidth)) * (boundMax - boundMin) / widget.offsetWidth + boundMin);
          val = val < boundMin ? boundMin : val > boundMax ? boundMax : val;
          scope.sliderValue = Math.round(val);
          scope.onSliderChange();
          input.focus()
        };

        scope.onEnd = function (e) {
          scope.leftActive = false;
          scope.rightActive = false;
        }


      }

    }
  }

  angular.module('dualRangeSlider', []).directive('dualRangeSlider', dualRangeSlider)


})();
