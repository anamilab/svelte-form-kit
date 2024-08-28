const isInViewport = (element: HTMLElement) => {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
};

const getFirstElement = (elements: HTMLElement[]): HTMLElement | null => {
	if (elements.length === 0) return null;

	return elements.reduce((first, current) => {
		return current.getBoundingClientRect().top < first.getBoundingClientRect().top
			? current
			: first;
	});
};

export const scrollToElement = (elements: HTMLElement[], padding = 150) => {
	const element = getFirstElement(elements);

	if (!element) return;

	if (!isInViewport(element))
		window.scrollTo({
			top: element.getBoundingClientRect().top + window.scrollY - padding,
			behavior: 'smooth'
		});
};

export const isEqual = (first: object, second: object) => {
	return JSON.stringify(first) === JSON.stringify(second);
};
