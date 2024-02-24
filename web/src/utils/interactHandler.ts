
type InteractListenerType = 'keydown' | 'keyup' | 'keypress' | 'click' | 'mousedown' | 'mouseup' | 'mousemove'



export function TempInteractListener(type: InteractListenerType, handler: (data: KeyboardEvent | MouseEvent) => void,
): {removeListener: () => void} {
    // const eventListener = (event: MessageEvent<NuiMessage<T>>) => {
    //     const { action: eventAction, data } = event.data;

    //     eventAction === action && handler(data);
    // };

    // const eventListener = (event: KeyboardEvent) => {
    //     console.log(event);
    //     handler(event);
    // }

    function removeListener() {
        // console.log('Removing event listener');
        window.removeEventListener(type, handler);
    }

    // Add the event listener on mount and remove it on unmount
    window.addEventListener(type, handler)
    return {removeListener};
}