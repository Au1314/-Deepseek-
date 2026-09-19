// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slides = document.querySelector('.slides');
    const slideItems = document.querySelectorAll('.slides img');
    const slideCount = slideItems.length;
    let currentIndex = 0;
    let slideWidth = slider.offsetWidth;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;

    // 设置轮播图宽度
    function setSlideWidth() {
        slideWidth = slider.offsetWidth;
        slideItems.forEach(slide => {
            slide.style.width = `${slideWidth}px`;
        });
        slides.style.width = `${slideWidth * slideCount}px`;
        goToSlide(currentIndex);
    }

    // 跳转到指定幻灯片
    function goToSlide(index) {
        currentIndex = index;
        currentTranslate = -index * slideWidth;
        slides.style.transform = `translateX(${currentTranslate}px)`;
    }

    // 下一张幻灯片
    function nextSlide() {
        if (currentIndex < slideCount - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        goToSlide(currentIndex);
    }

    // 自动轮播
    let interval = setInterval(nextSlide, 3000);

    // 触摸事件处理
    slides.addEventListener('touchstart', touchStart);
    slides.addEventListener('touchend', touchEnd);
    slides.addEventListener('touchmove', touchMove);

    // 鼠标事件处理
    slides.addEventListener('mousedown', touchStart);
    slides.addEventListener('mouseup', touchEnd);
    slides.addEventListener('mouseleave', touchEnd);
    slides.addEventListener('mousemove', touchMove);

    function touchStart(e) {
        clearInterval(interval);
        isDragging = true;
        startPos = getPositionX(e);
        animationID = requestAnimationFrame(animation);
    }

    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -100 && currentIndex < slideCount - 1) {
            currentIndex++;
        }
        
        if (movedBy > 100 && currentIndex > 0) {
            currentIndex--;
        }
        
        goToSlide(currentIndex);
        interval = setInterval(nextSlide, 3000);
    }

    function touchMove(e) {
        if (isDragging) {
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }

    function animation() {
        slides.style.transform = `translateX(${currentTranslate}px)`;
        if (isDragging) requestAnimationFrame(animation);
    }

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // 窗口大小改变时重新计算
    window.addEventListener('resize', setSlideWidth);

    // 初始化
    setSlideWidth();
});
