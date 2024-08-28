const isInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
};

export const scrollToElement = (element: HTMLElement, padding = 150) => {
	if (!isInViewport(element))
		window.scrollTo({
			top: element.getBoundingClientRect().top + window.scrollY - padding,
			behavior: 'smooth'
		});
};

export const isEqual = (first: object, second: object) => {
	return JSON.stringify(first) === JSON.stringify(second);
};
