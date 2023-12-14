let skipAutoSlideChange = [];

/**
* @param {Element} slide
*/
function getPreviousSlideSibling(slide){
	// if it is not the first element, return the one before
	if(slide.previousElementSibling)
		return slide.previousElementSibling;

	// iterate until there is no next element (go back to end)
	while(slide.nextElementSibling){
		slide = slide.nextElementSibling;
	}

	// return end slide 
	return slide;
}

/**
* @param {Element} slide
*/
function getNextSlideSibling(slide){
	// if it is not the last element, return the one after
	if(slide.nextElementSibling)
		return slide.nextElementSibling;

	// iterate until there is no previous element (go back to start)
	while(slide.previousElementSibling){
		slide = slide.previousElementSibling;
	}

	// return start slide
	return slide;
}

/**
* @param {Element} slide
*/
function setElementsBeforeClass(slide){
	// set "before" class for all elements which are in front of (before) slide
	while(slide.previousElementSibling){
		slide = slide.previousElementSibling;
		slide.classList.add("before");
	}
}

/**
* @param {Element} slider
*/
function removeElementsBeforeClass(slider){
	// remove "before" class for all elements
	slider.querySelectorAll(".slider-item.before").forEach(el => el.classList.remove("before"));
}

/**
* @param {Element} slider
* @param {Element} newActiveSlide
* @param {Element} currentActiveSlide
*/
function changeActiveSlide(slider, newActiveSlide, currentActiveSlide = undefined){
	removeElementsBeforeClass(slider);

	// if currentActiveSlide is not undefined, remove its "active" class
	currentActiveSlide?.classList.remove("active");

	newActiveSlide.classList.add("active");
	setElementsBeforeClass(newActiveSlide);
	setSliderSelectorStyle(slider.parentElement, newActiveSlide);
}

/**
* @param {Element} slider
*/
function nextSlide(slider){
	const activeSlide = slider.querySelector(".slider-item.active");
	changeActiveSlide(slider, getNextSlideSibling(activeSlide), activeSlide)
}

/**
* @param {Element} slider
*/
function previousSlide(slider){
	const activeSlide = slider.querySelector(".slider-item.active");
	changeActiveSlide(slider, getPreviousSlideSibling(activeSlide), activeSlide);
}

/**
* @param {Element} sliderWrapper
* @param {Element} slide
*/
function setSliderSelectorStyle(sliderWrapper, slide){
	// get the index of the currently active slide
	const index = [...sliderWrapper.querySelectorAll(".slider-item")].indexOf(slide);
	const allSelectors = [...sliderWrapper.querySelectorAll(".selector")];
	// remove "active" class for all selectors (not slides!!)
	allSelectors.forEach(el => el.classList.remove("active"));
	// set the "active" class again for the selector with the same index as the active slide
	allSelectors[index].classList.add("active");
}

/**
* @param {Element} slider
* @param {number} index
*/
function setSlide(slider, index = getCenterSlideIndex(slider)){
	// set slide by index
	changeActiveSlide(slider, [...slider.querySelectorAll(".slider-item")][index]);
}

/**
* @param {Element} slider
*/
function getCenterSlideIndex(slider){
	// get index of the slide that is in the center
	return Math.floor(amountOfSlides(slider) / 2)
}

/**
* @param {Element} slider
*/
function amountOfSlides(slider){
	// get the amount of slides available
	return [...slider.querySelectorAll(".slider-item")].length;
}

/**
* @param {Element} selectorWrapper
* @param {Element} sliderWrapper
*/
function setSlideSelector(selectorWrapper, sliderWrapper){
	selectorWrapper.innerHTML = "";
	const slideAmount = amountOfSlides(sliderWrapper);
	// calculate how many digits the slideAmount has
	const padAmount = Math.log(slideAmount) * Math.LOG10E + 1 | 0;
	for(let i = 0; i < slideAmount; ++i){
		// create element for selecting the slide by index
		const selectorBtn = document.createElement("button");
		selectorBtn.type = "button";
		// add leading '0' so all slide numbers are the same length ("03" instead of "3" if there is 10+ slides)
		selectorBtn.innerHTML = String(i + 1).padStart(padAmount, '0');
		selectorBtn.addEventListener("click", (e) => {
			setSlide(sliderWrapper, i);
			if(skipAutoSlideChange.indexOf(sliderWrapper) < 0)
				skipAutoSlideChange.push(sliderWrapper);
		});
		selectorBtn.classList.add("selector");
		selectorWrapper.appendChild(selectorBtn);
	}
}

/**
* @param {Element} sliderWrapper
*/
function initializeSlider(sliderWrapper){
	const slider = sliderWrapper.querySelector(".slider");
	sliderWrapper.querySelector(".btn-previous").addEventListener("click", (e) => {
		previousSlide(slider);
		if(skipAutoSlideChange.indexOf(sliderWrapper) < 0)
			skipAutoSlideChange.push(sliderWrapper);
	});
	sliderWrapper.querySelector(".btn-next").addEventListener("click", (e) => {
		nextSlide(slider);
		if(skipAutoSlideChange.indexOf(sliderWrapper) < 0)
			skipAutoSlideChange.push(sliderWrapper);
	});
	setSlideSelector(sliderWrapper.querySelector(".slide-selector-wrapper"), sliderWrapper);
	setSlide(slider);
	setInterval(() => {
			// if slide was manually changed recently, skip one automatic change
			const index = skipAutoSlideChange.indexOf(sliderWrapper);
			if(index >= 0){
				// remove the entry again, so next time it isn't skipped
				skipAutoSlideChange.splice(index, 1);
				return;
			}

			nextSlide(slider);
		},
		15000
	);
}

addEventListener("load", (e) =>{
	initializeSlider(document.querySelector("#first-slider-wrapper"));
	setInterval(() => document.querySelector(":root").style.setProperty("--animation-duration", "1s"), 50);
});
