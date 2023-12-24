export const scrollToElement = (element: HTMLElement, padding = 50) => {
    window.scrollTo({
        top:
            element.getBoundingClientRect().top +
            window.scrollY - padding,
        behavior: 'smooth'
    });
};

export const isEqual = (first: object, second: object) => {
    return JSON.stringify(first) === JSON.stringify(second)
}