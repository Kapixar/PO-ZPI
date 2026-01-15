import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/dashboard", "routes/dashboard.tsx"),
    route("/dashboard/subject-coordinator", "routes/dashboard/subject-coordinator.tsx"),
    route("/dashboard/member-of-program-committee", "routes/dashboard/member-of-program-committee.tsx"),
    route("/topic/:id", "routes/topic.$id.tsx"),
    route("/test", "routes/test.tsx"),
] satisfies RouteConfig;
