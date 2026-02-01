/// <reference types="jest" />



import { renderHook, act } from "@testing-library/react";
import { useTopicFilters } from "./useTopicFilters";
import type { Topic } from "~/services/topic.service";

const mockTopics: Topic[] = [
    {
        id: "1",
        title: "Advanced Machine Learning",
        description: "Deep learning project",
        supervisor: {
            id: "1",
            accountId: 100,
            fullName: "Dr. John Smith",
            title: "Dr",
            position: "Professor",
        },
        status: "ZATWIERDZONY",
        isOpen: true,
        isStandard: true,
        team: [
            { id: "1", fullName: "Alice Johnson", studentIndex: "S001" },
            { id: "2", fullName: "Bob Williams", studentIndex: "S002" },
        ],
        maxMembers: 4,
        creationDate: "2025-01-01",
    },
    {
        id: "2",
        title: "Web Application Development",
        description: "Building scalable web apps",
        supervisor: {
            id: "2",
            accountId: 101,
            fullName: "Prof. Jane Doe",
            title: "Prof",
            position: "Associate Professor",
        },
        status: "ZATWIERDZONY",
        isOpen: false,
        isStandard: true,
        team: [{ id: "3", fullName: "Charlie Brown", studentIndex: "S003" }],
        maxMembers: 3,
        creationDate: "2025-01-02",
    },
    {
        id: "3",
        title: "Mobile Application Design",
        description: "UI/UX and mobile development",
        supervisor: {
            id: "1",
            accountId: 100,
            fullName: "Dr. John Smith",
            title: "Dr",
            position: "Professor",
        },
        status: "OCZEKUJACY",
        isOpen: true,
        isStandard: false,
        team: [
            { id: "4", fullName: "Diana Prince", studentIndex: "S004" },
            { id: "5", fullName: "Eve Davis", studentIndex: "S005" },
            { id: "6", fullName: "Frank Miller", studentIndex: "S006" },
        ],
        maxMembers: 4,
        creationDate: "2025-01-03",
    },
    {
        id: "4",
        title: "Cloud Computing Infrastructure",
        description: "AWS and containerization",
        supervisor: {
            id: "3",
            accountId: 102,
            fullName: "Dr. Michael Chen",
            title: "Dr",
            position: "Lecturer",
        },
        status: "ZATWIERDZONY",
        isOpen: true,
        isStandard: true,
        team: [],
        maxMembers: 5,
        creationDate: "2025-01-04",
    },
];



describe("useTopicFilters", () => {
    // MARK: Search
    describe("Search Filtering", () => {
        it("should filter topics by title", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("machine");
            });

            expect(result.current.filteredTopics).toHaveLength(1);
            expect(result.current.filteredTopics[0].id).toBe("1");
        });

        it("should filter topics by supervisor name", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("jane");
            });

            expect(result.current.filteredTopics).toHaveLength(2);
            expect(result.current.filteredTopics[0].id).toBe("2");
        });

        it("should filter topics by supervisor title", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("prof");
            });

            expect(result.current.filteredTopics).toHaveLength(1);
            expect(result.current.filteredTopics[0].id).toBe("2");
        });

        it("should be case-insensitive", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("ADVANCED");
            });

            expect(result.current.filteredTopics).toHaveLength(1);
            expect(result.current.filteredTopics[0].title).toBe(
                "Advanced Machine Learning",
            );
        });

        it("should return empty array when search matches nothing", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("nonexistent");
            });

            expect(result.current.filteredTopics).toHaveLength(0);
        });

        it("should clear search and return all topics when search query is empty", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSearchQuery("machine");
            });
            expect(result.current.filteredTopics).toHaveLength(1);

            act(() => {
                result.current.setSearchQuery("");
            });
            expect(result.current.filteredTopics).toHaveLength(4);
        });
    });

    // MARK: Status
    describe("Status Filtering", () => {
        it("should filter topics by open status", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setShowOpenOnly(true);
            });

            expect(result.current.filteredTopics).toHaveLength(3);
            expect(result.current.filteredTopics.every((t) => t.isOpen)).toBe(
                true,
            );
        });

        it("should filter topics by approved status", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setShowApprovedOnly(true);
            });

            expect(result.current.filteredTopics).toHaveLength(3);
            expect(
                result.current.filteredTopics.every(
                    (t) => t.status === "ZATWIERDZONY",
                ),
            ).toBe(true);
        });

        it("should combine open and approved filters", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setShowOpenOnly(true);
                result.current.setShowApprovedOnly(true);
            });

            expect(result.current.filteredTopics).toHaveLength(2);
            expect(
                result.current.filteredTopics.every(
                    (t) => t.isOpen && t.status === "ZATWIERDZONY",
                ),
            ).toBe(true);
        });
    });

    // MARK: Team Size
    describe("Team Size Filtering", () => {
        it("should filter topics by minimum members", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setMinMembers(2);
            });

            expect(result.current.filteredTopics).toHaveLength(2);
            expect(
                result.current.filteredTopics.every((t) => t.team.length >= 2),
            ).toBe(true);
        });

        it("should filter topics by maximum members", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setMaxMembers(1);
            });

            expect(result.current.filteredTopics).toHaveLength(2);
            expect(
                result.current.filteredTopics.every((t) => t.team.length <= 1),
            ).toBe(true);
        });

        it("should filter topics by member range", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setMinMembers(1);
                result.current.setMaxMembers(2);
            });

            expect(result.current.filteredTopics).toHaveLength(2);
            expect(
                result.current.filteredTopics.every(
                    (t) => t.team.length >= 1 && t.team.length <= 2,
                ),
            ).toBe(true);
        });

        it("should handle zero members filter", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setMaxMembers(0);
            });

            expect(result.current.filteredTopics).toHaveLength(1);
            expect(result.current.filteredTopics[0].id).toBe("4");
        });
    });

    // MARK: Sorting
    describe("Sorting", () => {
        it("should sort topics by title ascending", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSortBy("title-asc");
            });

            const titles = result.current.filteredTopics.map((t) => t.title);
            const sortedTitles = [...titles].sort();
            expect(titles).toEqual(sortedTitles);
        });

        it("should sort topics by title descending", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSortBy("title-desc");
            });

            const titles = result.current.filteredTopics.map((t) => t.title);
            const sortedTitles = [...titles].sort().reverse();
            expect(titles).toEqual(sortedTitles);
        });

        it("should sort topics by team members ascending", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSortBy("members-asc");
            });

            const memberCounts = result.current.filteredTopics.map(
                (t) => t.team.length,
            );
            const sortedCounts = [...memberCounts].sort((a, b) => a - b);
            expect(memberCounts).toEqual(sortedCounts);
        });

        it("should sort topics by team members descending", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSortBy("members-desc");
            });

            const memberCounts = result.current.filteredTopics.map(
                (t) => t.team.length,
            );
            const sortedCounts = [...memberCounts].sort((a, b) => b - a);
            expect(memberCounts).toEqual(sortedCounts);
        });

        it("should preserve original order when sort is null", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            act(() => {
                result.current.setSortBy(null);
            });

            const ids = result.current.filteredTopics.map((t) => t.id);
            expect(ids).toEqual(["1", "2", "3", "4"]);
        });
    });



    
    // MARK: Edge Cases
    describe("Edge Cases", () => {
        it("should handle empty topics array", () => {
            const { result } = renderHook(() => useTopicFilters([]));

            expect(result.current.filteredTopics).toHaveLength(0);

            act(() => {
                result.current.setSearchQuery("anything");
            });

            expect(result.current.filteredTopics).toHaveLength(0);
        });

        it("should handle single topic", () => {
            const { result } = renderHook(() =>
                useTopicFilters([mockTopics[0]]),
            );

            expect(result.current.filteredTopics).toHaveLength(1);

            act(() => {
                result.current.setSortBy("title-asc");
            });

            expect(result.current.filteredTopics).toHaveLength(1);
            expect(result.current.filteredTopics[0].id).toBe("1");
        });

        it("should handle topics with special characters in title", () => {
            const topicsWithSpecial: Topic[] = [
                {
                    ...mockTopics[0],
                    id: "5",
                    title: "AI & Machine Learning with C++",
                },
            ];

            const { result } = renderHook(() =>
                useTopicFilters(topicsWithSpecial),
            );

            act(() => {
                result.current.setSearchQuery("C++");
            });

            expect(result.current.filteredTopics).toHaveLength(1);
        });
    });

    describe("State Management", () => {
        it("should initialize with correct default values", () => {
            const { result } = renderHook(() => useTopicFilters(mockTopics));

            expect(result.current.searchQuery).toBe("");
            expect(result.current.sortBy).toBeNull();
            expect(result.current.showOpenOnly).toBe(false);
            expect(result.current.showApprovedOnly).toBe(false);
            expect(result.current.minMembers).toBeNull();
            expect(result.current.maxMembers).toBeNull();
            expect(result.current.filteredTopics).toHaveLength(4);
        });

    });
});
