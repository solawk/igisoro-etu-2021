(function(exports)
{

    exports.Parse = function(msg)
    {
        const parts = msg.split("?");
        const params = new Map;
        for (const p of parts)
        {
            if (p === "") continue;

            params.set(p.slice(0, 1), p.slice(1));
        }

        return params;
    }

})(typeof exports === 'undefined' ? this['mesutils'] = {} : exports);