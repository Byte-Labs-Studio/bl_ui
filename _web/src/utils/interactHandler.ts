
type InteractListenerType = 'keydown' | 'keyup' | 'keypress' | 'click' | 'mousedown' | 'mouseup' | 'mousemove'



export function TempInteractListener(type: InteractListenerType, handler: (data: KeyboardEvent | MouseEvent) => void,
): {removeListener: () => void} {
    function removeListener() {
        window.removeEventListener(type, handler);
    }

    // Add the event listener on mount and remove it on unmount
    window.addEventListener(type, handler)
    return {removeListener};
}