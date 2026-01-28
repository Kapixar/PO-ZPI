import { useState, useMemo } from "react";
import type { Topic } from "~/services/topic.service";

export type SortOption = "title-asc" | "title-desc" | "members-asc" | "members-desc" | null;

export function useTopicFilters(topics: Topic[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>(null);
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [showApprovedOnly, setShowApprovedOnly] = useState(false);
    const [minMembers, setMinMembers] = useState<number | null>(null);
    const [maxMembers, setMaxMembers] = useState<number | null>(null);

    const filteredTopics = useMemo(() => {
        return topics
            .filter((topic) => {
                // Search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const matchesTitle = topic.title.toLowerCase().includes(query);
                    const matchesSupervisor =
                        `${topic.supervisor.title} ${topic.supervisor.fullName}`
                            .toLowerCase()
                            .includes(query);
                    if (!matchesTitle && !matchesSupervisor) return false;
                }

                // Open status filter
                if (showOpenOnly && !topic.isOpen) return false;

                // Approved status filter
                if (showApprovedOnly && topic.status !== "ZATWIERDZONY")
                    return false;

                // Min members filter
                if (minMembers !== null && topic.team.length < minMembers)
                    return false;

                // Max members filter
                if (maxMembers !== null && topic.team.length > maxMembers)
                    return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === "title-asc") {
                    return a.title.localeCompare(b.title);
                }
                if (sortBy === "title-desc") {
                    return b.title.localeCompare(a.title);
                }
                if (sortBy === "members-asc") {
                    return a.team.length - b.team.length;
                }
                if (sortBy === "members-desc") {
                    return b.team.length - a.team.length;
                }
                return 0;
            });
    }, [topics, searchQuery, sortBy, showOpenOnly, showApprovedOnly, minMembers, maxMembers]);

    return {
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        showOpenOnly,
        setShowOpenOnly,
        showApprovedOnly,
        setShowApprovedOnly,
        minMembers,
        setMinMembers,
        maxMembers,
        setMaxMembers,
        filteredTopics,
    };
}
