(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.mui = factory());
}(this, (function () { "use strict"; 
  var mui = {};
  // console.log("abc")

  var ANIMATOR_DURATION_SCALE = 1;
  var TOUCH_END_DELAY = 50;
  
  var ripple = {}
  
  /* 点击涟漪 */
  ripple.styleElement = document.createElement('style')
  ripple.styleElement.innerHTML = `
body{
  --mui-animator_duration_scale: ${ANIMATOR_DURATION_SCALE};
}

.mui-ripple{
  position: relative;
  overflow: hidden;
}

.mui-ripple_wave{
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  padding: 0;
  font-size: 0;
  background-color: var(--mui-color_on_background_opacity_10, rgba(0, 0, 0, 0.1));
  
  border-radius: 50%;
  transition: all cubic-bezier(0.4, 0.0, 0.2, 1) calc(0.20s * var(--mui-animator_duration_scale)), 
      opacity cubic-bezier(0.4, 0, 0.2, 1) calc(0.15s * var(--mui-animator_duration_scale)), 
      background-color 0s 1e100s;
  /* transition: all cubic-bezier(0.4, 0.0, 0.2, 1) calc(0.3s * var(--mui-animator_duration_scale)), 
      opacity cubic-bezier(0.4, 0, 0.2, 1) calc(0.1s * var(--mui-animator_duration_scale)), 
      background-color 0s 1e100s; */
  pointer-events: none;
  will-change: transform;
  opacity: 1;
}

.mui-theme_dark .mui-ripple_wave{
  background-color: var(--mui-color_on_background_opacity_10, rgba(255, 255, 255, 0.1));
}


.mui-ripple_black .mui-ripple_wave, 
.mui-ripple_black.mui-ripple_wave{
  background-color: rgba(0, 0, 0, 0.1);
}

.mui-ripple_white .mui-ripple_wave, 
.mui-ripple_white.mui-ripple_wave{
  background-color: rgba(255, 255, 255, 0.1);
}

.mui-ripple_accent .mui-ripple_wave, 
.mui-ripple_accent.mui-ripple_wave{
  background-color: rgba(var(--mui-color_accent_rgb), 0.1);
}

.mui-ripple_wave_wait_out{
  transition: all cubic-bezier(0.4, 0.0, 0.2, 1) calc(0.20s * var(--mui-animator_duration_scale)), 
      opacity cubic-bezier(0.4, 0, 0.2, 1) calc(0s * var(--mui-animator_duration_scale)), 
      background-color 0s 1e100s;
  opacity: 1;
}

@keyframes ripple_wave_out_animation{
  0%{
    opacity: 1;
  }
  100%{
    opacity: 0;
  }
}

.mui-ripple_wave_out{
  animation: ripple_wave_out_animation linear calc(0.15s * var(--mui-animator_duration_scale));
  /* transition: opacity linear 0.3s; */
}















.mui-md3_ripple .mui-ripple_wave, 
.fmui-md3_ripple .mui-ripple_wave{
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  padding: 0;
  font-size: 0;
  
  background-color: transparent;
  background-image: radial-gradient(closest-side, rgba(0, 0, 0, calc(1 * var(--o))) 0%, rgba(0, 0, 0, calc(1 * var(--o))) 32.5%, rgba(0, 0, 0, calc(0.75 * var(--o))) 50%, rgba(0, 0, 0, calc(0 * var(--o))) 75%);
  transform: scale(2);
  --o: 0.2;
  border-radius: 50%;
  transition: all linear 0.2s, opacity linear 0.05s;
  pointer-events: none;
  opacity: 1;
}


`

  document.querySelector("head")
    .append(ripple.styleElement)

  var sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  var nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));


  document.body.addEventListener('touchstart', async function(ev) {
    // 更新选择控件涟漪颜色
    let selectionControl;
    if(selectionControl = ev.target.closest('.mui-switch, .mui-checkbox, .mui-radio')){
      let rippleElement = selectionControl.querySelector('.mui-ripple')
      let input;
      let bool;
      if(rippleElement){
        if(input = selectionControl.querySelector(`input[type="checkbox"], input[type="radio"]`)){
          bool = input.checked
        }
        if(bool){
          rippleElement.classList.add('mui-ripple_accent')
        }else{
          rippleElement.classList.remove('mui-ripple_accent')
        }
      }
    }
  
    let pos = ev.touches[ev.touches.length - 1];
    let target
    target = ev.target.closest('.mui-ripple')
    if (ev.target.closest('.mui-ripple_dispatcher')) {
      target = ev.target.closest('.mui-ripple_dispatcher').querySelector('.mui-ripple')
    }
    if (!target) {
      return
    }
    if (pos) {
      target.rippleLastPos = pos
    }
    ripple.handleStart(pos, target)
  })

  /* document.body.addEventListener('touchmove', async function (ev){
    let target = ev.target.closest('.mui-ripple')
    if(ev.target.closest('.mui-ripple_dispatcher')){
      target = ev.target.closest('.mui-ripple_dispatcher').querySelector('.mui-ripple')
    }
    if(!target){ return }
    let pos = ev.touches[ev.touches.length - 1];
    
    // handleEnd(target.rippleLastPos, target)
  }) */

  document.body.addEventListener('touchmove', async function(ev) {
    let pos = ev.touches[ev.touches.length - 1];
    let target
    target = ev.target.closest('.mui-ripple')
    if (ev.target.closest('.mui-ripple_onmove_dispatcher')) {
      target = ev.target.closest('.mui-ripple_onmove_dispatcher').querySelector('.mui-ripple')
    }
    if (!target) {
      return
    }
    if (pos) {
      target.rippleLastPos = pos
    }
    ripple.handleStart(pos, target)
  })

  document.body.addEventListener('touchend', async function(ev) {
    let pos = ev.touches[ev.touches.length - 1];
    let target = ev.target.closest('.mui-ripple')
    if (ev.target.closest('.mui-ripple_dispatcher')) {
      target = ev.target.closest('.mui-ripple_dispatcher').querySelector('.mui-ripple')
    }
    if (ev.target.closest('.mui-ripple_onmove_dispatcher')) {
      target = ev.target.closest('.mui-ripple_onmove_dispatcher').querySelector('.mui-ripple')
    }
    if (!target) {
      return
    }
    if (pos) {
      target.rippleLastPos = pos
    }

    ripple.handleEnd(target.rippleLastPos, target)
  })


  /*
  pointerdown 
  pointermove 
  pointerup 
  pointerout
  pointerleave
  */



  ripple.handleStart = async function(pos, target) {
    if (target.querySelector(".mui-ripple_wave:not(.mui-ripple_wave_wait_out)")) {
      return;
    }

    let targetRect = target.getBoundingClientRect()
    /* let targetCenter = {
      x: (targetRect.left + targetRect.right) / 2, 
      y: (targetRect.top + targetRect.bottom) / 2,
    } */
    let targetCenter = {
      x: (targetRect.width) / 2,
      y: (targetRect.height) / 2
    }

    let ripple_wave = document.createElement('div')
    let wave_scale = Math.sqrt((target.offsetWidth ** 2) + (target.offsetHeight ** 2))
    let inital_scale = 0.5
    // inital_scale = 2

    if (target.matches('.mui-rounded')) {
      wave_scale = Math.min(targetRect.width, targetRect.height)
    }
    
    if (target.matches('.mui-button_icon_button_style')) {
      inital_scale = 0.85
      /* 在top_app_bar_button_group里 */
      if (target.closest('.mui-top_app_bar_button_group')) {
        inital_scale = 0.75
      }
    }
    
    // inital_scale = 1.5
    var isMd3 = target.closest('.mui-md3_ripple') ? true : false;
    if(isMd3){
      inital_scale = 0
    }

    ripple_wave.classList.add('mui-ripple_wave')

    let left = pos.clientX - targetRect.left
    let top = pos.clientY - targetRect.top

    let inital_max_range
    if(inital_scale > 1){
      let a = inital_scale - 1
      left = targetRect.width - left;
      top = targetRect.height - top;
      inital_max_range = wave_scale * 0.5 * (inital_scale - 1)
      // 不设置inital_max_range会使 inital_max_range 为undefined，判断是否执行偏移矫正的bool始终为false
    }else{
       inital_max_range = wave_scale / 2 - (wave_scale * inital_scale / 2);
    }
    // console.log(inital_max_range = Math.abs(inital_max_range));


    // 距离限制
    if (Math.sqrt(Math.pow(left - targetCenter.x, 2) + Math.pow(top - targetCenter.y, 2)) > inital_max_range) {
      let [cx, cy, radius, px, py] = [
        targetCenter.x, targetCenter.y,
        inital_max_range,
        left, top
      ]

      // 计算圆心到圆外点的向量
      const dx = px - cx;
      const dy = py - cy;

      // 计算圆心到圆外点的距离
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 计算单位向量
      const ux = dx / distance;
      const uy = dy / distance;

      // 计算交点坐标（从圆心沿向量方向移动半径长度）
      const ix = cx + ux * radius;
      const iy = cy + uy * radius;

      [left, top] = [ix, iy];
    }

    // 移到左上角
    /*left = (left - (wave_scale * inital_scale / 2))
    top = (top - (wave_scale * inital_scale / 2))
    */
    /* setStyles(ripple_wave, {
      left: left + 'px', 
      top: top + 'px', 
      width: (wave_scale * inital_scale) + 'px',
      height: (wave_scale * inital_scale) + 'px', 
      opacity: 0, 
    });
    
    target.prepend(ripple_wave)
    
    setStyles(ripple_wave, {
      left: ((target.offsetWidth / 2) - (wave_scale / 2)) + 'px', 
      top: ((target.offsetHeight / 2) - (wave_scale / 2)) + 'px', 
      width: (wave_scale) + 'px', 
      height: (wave_scale) + 'px', 
      opacity: "", 
    }); */
    
    ripple_wave.promiseEnd = new Promise((r) => {
      ripple_wave.endPromiseResolver = r
    })
    
    let size2 = isMd3 || target.closest('.fmui-md3_ripple') ? true : false;
    
    
    setStyles(ripple_wave, {
      left: ((targetRect.width / 2) - (wave_scale / 2)) + 'px', 
      top: ((targetRect.height / 2) - (wave_scale / 2)) + 'px', 
      width: (wave_scale) + 'px', 
      height: (wave_scale) + 'px', 
      opacity: "0", 
      
      transform: `translate3d(${left - targetCenter.x + 'px'}, ${top - targetCenter.y + 'px'}, 0) scale(${inital_scale})`, 
    });
    
    target.prepend(ripple_wave)
    reflow(ripple_wave)
    
    setStyles(ripple_wave, {
      opacity: "", 
      transform: `translate3d(${0}, ${0}, 0) scale(${size2 ? 2 : 1})`
    })
    
    ripple_wave.addEventListener('animationend', function() {
      ripple_wave.remove()
    }, { once: true })

    
    
    await sleep(250 * ANIMATOR_DURATION_SCALE)
    if(isMd3){
      await sleep(50 * ANIMATOR_DURATION_SCALE)
    }
    await ripple_wave.promiseEnd;

    ripple_wave.classList.add('mui-ripple_wave_out')
    

    // 稳定移除
    await sleep(300 * ANIMATOR_DURATION_SCALE)
    ripple_wave.remove()
  }

  ripple.handleMove = function() {

  }

  ripple.handleEnd = async function(pos, target) {
    document.body.querySelectorAll('.mui-ripple_wave')
      .forEach(async function(ripple_wave) {
        await sleep(TOUCH_END_DELAY);
        ripple_wave.classList.add('mui-ripple_wave_wait_out')
        ripple_wave.style.opacity = "0"
        reflow(ripple_wave)
        ripple_wave.style.opacity = ""
        ripple_wave.endPromiseResolver();
      })
  }
  
  mui.ripple = ripple;
  
  
  
  

  /* 
   ==================================================
   ********** 滑块 slider **********
   ==================================================
  */

  document.body.addEventListener('touchmove', async function(ev) {
    let target = ev.target.closest('.mui-slider')
    if (!target) {
      return
    }
    target.classList.add("mui-touch_active_state")
  })

  document.body.addEventListener('touchend', async function(ev) {
    let target = ev.target.closest('.mui-slider')
    if (!target) {
      return
    }
    
    let thumb = target.querySelector(".mui-slider_box_thumb")
    
    thumb.style.transition = "0s";
    thumb.style.width = thumb.style.height = "0";
    reflow(thumb);
    thumb.style.width = thumb.style.height = "";
    reflow(thumb);
    thumb.style.transition = "";
    
    // thumb.style.transition = ""
    
    await sleep(TOUCH_END_DELAY)
    target.classList.remove("mui-touch_active_state")
  })

  document.body.addEventListener('input', async function(ev) {
    let target = ev.target.closest('.mui-slider');
    if (!target) {
      return
    };
    let inputElement = target.querySelector("input[type='range']");
    // console.log("1", inputElement, inputElement.min, inputElement.max, inputElement.step, inputElement.value);
    let value = (inputElement.value - inputElement.min) / (inputElement.max - inputElement.min)
    target.style.setProperty('--value', value);
  })

  document.body.addEventListener('change', async function(ev) {
    let target = ev.target.closest('.mui-slider')
    if (!target) {
      return
    }
    // console.log("2")
  })
  
  /* 
   ==================================================
   ********** 函数库 fn **********
   ==================================================
  */
  
  var fn = {}
  
  function textToElement(text){
    var container = document.createElement('div');
    container.innerHTML = text;
    // console.log(container.firstElementChild)
    return container.firstElementChild
  }
  
  function setStyles(element, object){
    var keys = Object.keys(object)
    for(let key of keys){
      let value = object[key];
      element.style[key] = value;
    }
  }
  
  function isUndefined(target) {
      return typeof target === 'undefined';
  }
  
  function exsit(target) {
      return (typeof target !== 'undefined') && (target !== null);
  }
  
  function reflow(element){
    element.offsetLeft
  }
  
  function data(element, key, value){
    if(!exsit(element)) return element;
    if(!exsit(element.muiDataStorage)){ element.muiDataStorage = {} };
    if(!exsit(value) && exsit(key)) return element.muiDataStorage[key];
    return (element.muiDataStorage[key] = value);
  }
 
  /* var { ...rest } = fn;
  console.log(isUndefined(fn.isUndefined)) */
  
  mui.fn = { textToElement, setStyles, isUndefined, data, exsit };

  /* 
   ==================================================
   ********** 队列 queue **********
   ==================================================
  */
  
  var Queue = function Queue(maxLength){
    if(!new.target){
      throw new Error("Missing new");
      /* console.warn(new Error("Missing new"));
      return new Queue(); */
    }
    this.maxLength = maxLength || Infinity;
    this.list = []
    // console.log(this, new.target)

    return this;
  }
  
  Queue.prototype.push = function(fn){
    if(this.list.length < this.maxLength){
      this.list.push(fn);
    }else{
      console.warn('queue push failed')
    }
  }
  
  Queue.prototype.pop = function(){
    if(this.list.length){
      return (this.list.shift())();
    }
    return;
  }

  /* 
   ==================================================
   ********** 吐司 toast **********
   ==================================================
  */
  
  var Toast = function Toast(text, duration){
    if(!new.target){
      throw new Error("Missing new");
      /* console.warn(new Error("Missing new"));
      return; */
    }
    
    this.text = text;
    this.duration = duration;
    
    this.element = textToElement(`
      <div class="mui-toast mui-toast_hide">
        <span class="mui-toast_text">text</span>
      </div>
    `);
    
    this.element.querySelector('.mui-toast_text').textContent = this.text;
    
    if(toast.currentInstance){
      toast.queue.push(()=>{this.show()})
    }else{
      this.show()
    }

    return this;
  }

  Toast.prototype.init = function(){
    
  }
  
  Toast.prototype.show = async function(){
    // console.log(1175, this)
    toast.currentInstance = this
    document.body.append(this.element)
    reflow(this.element)
    this.element.classList.remove('mui-toast_hide')
    
    await sleep(this.duration/* + (500 * ANIMATOR_DURATION_SCALE) */);
    // console.log(Toast)
    this.hide()
  }
  
  Toast.prototype.hide = async function(){
    this.element.addEventListener('transitionend', ()=>{this.element.remove()}, { once: true });
    this.element.classList.add('mui-toast_hide')
    toast.currentInstance = null;
    toast.queue.pop();
  }
  
  var toast = {
    showText: function(text){return text}, 
    queue: new Queue(25), 
    currentInstance: null, 
  };
  
  toast.showText = function(text, duration){
    var toast = new Toast(text, duration || 2000)
    // console.log(toast, toast.element)
  };
  
  mui.Toast = Toast
  
  mui.toast = toast.showText
  mui.mui_toast = toast
  
  // mui.toast('hello_world')
  
  /* 
   ==================================================
   ********** 遮罩 overlay **********
   ==================================================
  */
  
  var overlay = {
    level: 0, 
    element: textToElement(`<div class="mui-overlay"></div>`), 
  }
  
  overlay.show = function(zIndex, opacity){
    console.log(zIndex, opacity)
    if(!exsit(zIndex)){
      var zIndex = 1000;
    }
    if(!exsit(opacity)){
      var opacity = 0.6;
    }
    if(!overlay.element.isConnected){
      document.body.append(overlay.element)
    }
    setStyles(overlay.element, { zIndex, backgroundColor: `rgba(0, 0, 0, ${opacity})` })
    reflow(overlay.element)
    overlay.element.classList.add('mui-overlay_show')
    overlay.level++;
    
  }
  
  overlay.hide = function(force){
    console.log(force)
    if(force){ overlay.level = 1 }
    if(--overlay.level === 0){
      overlay.element.classList.remove('mui-overlay_show')
      overlay.element.addEventListener('transitionend', function(){
        if(!overlay.element.classList.contains('mui-overlay_show')){
          overlay.element.remove()
        }
      }, { once: true })
    }
  }
  
  // overlay.show(void 0, 1)
  
  mui.overlay = overlay
  
  
  return mui;
})));