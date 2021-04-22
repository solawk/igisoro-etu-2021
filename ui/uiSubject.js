import
{
    Observer
} from "./uiObserver.js";

export let GameObservers = new Set;

export function AddObserver(trigger, callback)
{
    GameObservers.add(new Observer(trigger, callback));
}

export function Notify(trigger)
{
    for (let o of GameObservers)
    {
        o.notify(trigger);
    }
}