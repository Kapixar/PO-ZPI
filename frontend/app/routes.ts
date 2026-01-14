import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/dashboard", "routes/dashboard.tsx"),
    route("/test", "routes/test.tsx"),
    route("/dashboard/subject-coordinator", "routes/dashboard/subject-coordinator.tsx"),
    route("/dashboard/member-of-program-committee", "routes/dashboard/member-of-program-committee.tsx"),
    route("/my-profile", "routes/my-profile.tsx"),
    route("/topic/:id", "routes/topic-details.tsx")
] satisfies RouteConfig;
