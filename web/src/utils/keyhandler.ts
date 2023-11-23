
type KeyListenerType = 'keydown' | 'keyup' | 'keypress';
/**
 * Listen for an event from the Client
 * @param action The name of the event to listen for
 * @param handler The callback to run when the event is received
 * @returns {function}
 **/
export function TempKeyListener(type: KeyListenerType, handler: (data: KeyboardEvent) => void,
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