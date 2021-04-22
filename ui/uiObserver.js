export function Observer(trigger, callback)
{
    this.trigger = trigger;
    this.callback = callback;
}

Observer.prototype.notify = function(trigger)
{
    if (trigger === this.trigger)
    {
        this.callback();
    }
}