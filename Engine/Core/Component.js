/**
 * Component class
 * @class Component
 * @description A class that represents a component for the UI
 */
export default class Component 
{
    constructor({ element, elements }) 
    {
        this.selector = element;
        this.selectorChildren = {
            ...elements,
        };

        this.init();
    }

    init()
    {
        this.getElement();
        this.getChildrens();        
    }

    /**
     * Get the element
     * @method getElement
     * @description Get the main element
     * @returns {HTMLElement} The element
     */
    getElement() 
    {
        if (this.selector instanceof window.HTMLElement) {
            this.element = this.selector;
        } else {
            this.element = document.querySelector(this.selector);
        }
    }

    /**
     * Get the childrens
     * @method getChildrens
     * @description Get the childrens
     * @returns {Object} The childrens
     */
    getChildrens()
    {
        this.elements = {};

		Object.keys(this.selectorChildren).forEach((key) => {
			const entry = this.selectorChildren[key];
            if (
                entry instanceof window.HTMLElement ||
                entry instanceof window.NodeList ||
                Array.isArray(entry)
            ) {
                this.elements[key] = entry;
            } else {
                this.elements[key] = document.querySelectorAll(entry);

                if (this.elements[key].length === 0) {
                this.elements[key] = null;
                } else if (this.elements[key].length === 1) {
                this.elements[key] = document.querySelector(entry);
                }
            }
        });
    }
}