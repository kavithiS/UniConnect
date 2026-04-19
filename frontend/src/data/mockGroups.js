export const MOCK_GROUPS = [
  {
    _id: "mock-group-1",
    title: "Smart Campus App Team",
    groupName: "Smart Campus App Team",
    description:
      "Building a campus helper app for announcements, schedules, and student services.",
    groupCode: "IT100-101",
    members: [
      {
        _id: "mock-member-1",
        name: "Nimal Perera",
        role: "Frontend Lead",
        skills: ["React", "Tailwind CSS"],
      },
      {
        _id: "mock-member-2",
        name: "Ayesha Khan",
        role: "Backend Lead",
        skills: ["Node.js", "MongoDB"],
      },
    ],
    memberLimit: 5,
    requiredSkills: ["React", "Node.js", "MongoDB"],
    status: "active",
    createdBy: { _id: "mock-owner-1", name: "Tharindu Silva" },
    recommendations: [
      {
        _id: "mock-rec-1",
        name: "Mihiri Jayasinghe",
        matchScore: 92,
        analysis: "Strong fit for full-stack and student portal work.",
        matchedSkills: ["React", "MongoDB"],
        missingSkills: ["Node.js"],
      },
    ],
  },
  {
    _id: "mock-group-2",
    title: "AI Study Assistant",
    groupName: "AI Study Assistant",
    description:
      "Creating a lightweight AI companion for summarizing notes and answering study questions.",
    groupCode: "IT100-102",
    members: [
      {
        _id: "mock-member-3",
        name: "Kavindu Fernando",
        role: "ML Engineer",
        skills: ["Python", "NLP"],
      },
    ],
    memberLimit: 4,
    requiredSkills: ["Python", "NLP", "UI Design"],
    status: "active",
    createdBy: { _id: "mock-owner-2", name: "Nehara Dissanayake" },
    recommendations: [],
  },
  {
    _id: "mock-group-3",
    title: "E-Commerce Platform",
    groupName: "E-Commerce Platform",
    description:
      "Developing a modern online store with cart, checkout, and order tracking features.",
    groupCode: "IT100-103",
    members: [
      {
        _id: "mock-member-4",
        name: "Rashmika Jayawardena",
        role: "UI Developer",
        skills: ["React", "CSS"],
      },
      {
        _id: "mock-member-5",
        name: "Sachini Weerasinghe",
        role: "API Developer",
        skills: ["Express", "MongoDB"],
      },
      {
        _id: "mock-member-6",
        name: "Pasindu Wickramasinghe",
        role: "Payments Integrator",
        skills: ["Payment Gateway", "Testing"],
      },
    ],
    memberLimit: 6,
    requiredSkills: ["React", "Express", "Payment Gateway"],
    status: "active",
    createdBy: { _id: "mock-owner-3", name: "Uresha Silva" },
    recommendations: [],
  },
  {
    _id: "mock-group-4",
    title: "Task Manager Pro",
    groupName: "Task Manager Pro",
    description:
      "A collaborative project management tool with task assignment and deadline tracking.",
    groupCode: "IT100-104",
    members: [
      {
        _id: "mock-member-7",
        name: "Madhuranga Jayasuriya",
        role: "Product Owner",
        skills: ["TypeScript", "UI/UX"],
      },
    ],
    memberLimit: 4,
    requiredSkills: ["TypeScript", "Node.js", "UI/UX"],
    status: "closed",
    createdBy: { _id: "mock-owner-4", name: "Ishara Abeykoon" },
    recommendations: [],
  },
  {
    _id: "mock-group-5",
    title: "Campus Event Hub",
    groupName: "Campus Event Hub",
    description:
      "A portal for discovering student events, registering attendance, and sharing updates.",
    groupCode: "IT100-105",
    members: [
      {
        _id: "mock-member-8",
        name: "Dulani Peris",
        role: "Frontend Developer",
        skills: ["React", "Design Systems"],
      },
      {
        _id: "mock-member-9",
        name: "Nishan Rodrigo",
        role: "Integration Developer",
        skills: ["Firebase", "API Integration"],
      },
    ],
    memberLimit: 5,
    requiredSkills: ["React", "Firebase", "API Integration"],
    status: "active",
    createdBy: { _id: "mock-owner-5", name: "Kavithma Amarasinghe" },
    recommendations: [],
  },
  {
    _id: "mock-group-6",
    title: "Health Tracker Dashboard",
    groupName: "Health Tracker Dashboard",
    description:
      "Designing a wellness dashboard for tracking workouts, meals, and daily habits.",
    groupCode: "IT100-106",
    members: [
      {
        _id: "mock-member-10",
        name: "Hiruni Thilakarathne",
        role: "Dashboard Designer",
        skills: ["React", "Charts"],
      },
    ],
    memberLimit: 3,
    requiredSkills: ["React", "Charts", "API Design"],
    status: "archived",
    createdBy: { _id: "mock-owner-6", name: "Sahan Wijesinghe" },
    recommendations: [],
  },
];

export const isMockGroupId = (groupId) =>
  typeof groupId === "string" && groupId.startsWith("mock-group-");

export const getMockGroupById = (groupId) =>
  MOCK_GROUPS.find((group) => group._id === groupId) || null;
