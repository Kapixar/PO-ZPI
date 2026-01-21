import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/topics", "routes/topics-list.tsx"),
    route("/my-profile", "routes/my-profile.tsx"),
    route("/topic/:id", "routes/topic.$id.tsx"),
    route("/test", "routes/test.tsx"),
    route("/pending", "routes/pending.tsx"),
] satisfies RouteConfig;
