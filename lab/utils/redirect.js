import {redirectHashbang, redirectBrowser} from "rouct";

//Export redirect wrapper
export function redirect (to) {
    //return redirectHashbang(to);
    return redirectBrowser(to);
}

//Redirect to a sandbox
export function redirectToSandbox (mode, id) {
    return redirect(`/editor?${mode}=${encodeURIComponent(id)}`);
}

