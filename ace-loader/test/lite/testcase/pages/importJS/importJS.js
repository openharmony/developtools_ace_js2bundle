/* Test import syntax  */
import router from "@system.router";

export default {
    goHome() {
        router.replace({ uri: "pages/index/index" });
    }
}