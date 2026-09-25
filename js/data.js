var SahaKosh = (function () {
    var PREFIX = "sahakosh_";

    function load(key, fallback) {
        try {
            var raw = window.localStorage.getItem(PREFIX + key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }
    function save(key, value) {
        try {
            window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }
    function nextId(prefix) {
        var counters = load("counters", {});
        counters[prefix] = (counters[prefix] || 0) + 1;
        save("counters", counters);
        return prefix + "-" + (1000 + counters[prefix]);
    }

    var DEFAULT_MEMBERS = {
        "M-2026-002": {
            id: "M-2026-002",
            name: "Sanjeev Shrestha",
            branch: "Itahari Branch",
            phone: "+977 9841-XXXXXX",
            email: "sanjeev.s@example.com",
            address: "Itahari-5, Sunsari",
            nominee: "Sarita Shrestha",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Jan 2026",
            balance: "NPR 1,24,500.00",
            loanStatus: "Active",
            loanChip: "green",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--green-700)",
                    title: "EMI Payment — Rs. 15,200",
                    date: "Aug 24, 2026 · 10:42 AM",
                },
                {
                    color: "var(--blue-700)",
                    title: "Savings Deposit — Rs. 8,000",
                    date: "Aug 10, 2026 · 3:20 PM",
                },
                {
                    color: "var(--amber-900)",
                    title: "Loan Renewal Requested",
                    date: "Jul 28, 2026 · 9:05 AM",
                },
                {
                    color: "var(--green-700)",
                    title: "KYC Verified by Admin",
                    date: "Jan 15, 2026 · 11:00 AM",
                },
            ],
        },
        "M-2026-001": {
            id: "M-2026-001",
            name: "Aayush Dhungel",
            branch: "Kathmandu Branch",
            phone: "+977 9803-XXXXXX",
            email: "aayush.d@example.com",
            address: "Baneshwor, Kathmandu",
            nominee: "Bishal Dhungel",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Feb 2026",
            balance: "NPR 85,200.00",
            loanStatus: "None",
            loanChip: "grey",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--blue-700)",
                    title: "Fixed Deposit Renewed — Rs. 85,200",
                    date: "Aug 19, 2026 · 1:10 PM",
                },
                {
                    color: "var(--green-700)",
                    title: "KYC Verified by Admin",
                    date: "Feb 3, 2026 · 10:20 AM",
                },
            ],
        },
        "M-2025-102": {
            id: "M-2025-102",
            name: "Saujal Karki",
            branch: "Itahari Branch",
            phone: "+977 9851-XXXXXX",
            email: "saujal.k@example.com",
            address: "Itahari-3, Sunsari",
            nominee: "Manisha Karki",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Nov 2025",
            balance: "NPR 12,000.50",
            loanStatus: "Overdue",
            loanChip: "red",
            verification: "○ Pending",
            activity: [
                {
                    color: "var(--red-700)",
                    title: "EMI Payment Missed",
                    date: "Aug 20, 2026 · 9:00 AM",
                },
                {
                    color: "var(--blue-700)",
                    title: "Savings Deposit — Rs. 1,500",
                    date: "Jul 30, 2026 · 4:45 PM",
                },
            ],
        },
        "M-2025-101": {
            id: "M-2025-101",
            name: "Ujawal Acharya",
            branch: "Panchthar Branch",
            phone: "+977 9818-XXXXXX",
            email: "ujawal.a@example.com",
            address: "Phidim, Panchthar",
            nominee: "Rekha Acharya",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Aug 2025",
            balance: "NPR 3,45,000.00",
            loanStatus: "Active",
            loanChip: "green",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--green-700)",
                    title: "Business Loan Disbursed — Rs. 300,000",
                    date: "Aug 5, 2026 · 11:15 AM",
                },
                {
                    color: "var(--blue-700)",
                    title: "Savings Deposit — Rs. 20,000",
                    date: "Jul 12, 2026 · 2:30 PM",
                },
            ],
        },
        "M-2024-112": {
            id: "M-2024-112",
            name: "Neha Karki",
            branch: "Inaruwa Branch",
            phone: "+977 9860-XXXXXX",
            email: "neha.k@example.com",
            address: "Inaruwa-2, Sunsari",
            nominee: "Suman Karki",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "May 2024",
            balance: "NPR 56,000.00",
            loanStatus: "None",
            loanChip: "grey",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--red-700)",
                    title: "Withdrawal — Rs. 5,000",
                    date: "Aug 25, 2026 · 2:14 PM",
                },
                {
                    color: "var(--blue-700)",
                    title: "Savings Deposit — Rs. 3,500",
                    date: "Aug 3, 2026 · 10:05 AM",
                },
            ],
        },
        "M-2024-111": {
            id: "M-2024-111",
            name: "Inusha Rai",
            branch: "Dhankuta Branch",
            phone: "+977 9840-XXXXXX",
            email: "inusha.r@example.com",
            address: "Dhankuta-4",
            nominee: "Prakash Rai",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Feb 2024",
            balance: "NPR 4,500.00",
            loanStatus: "None",
            loanChip: "grey",
            verification: "○ Pending",
            activity: [
                {
                    color: "var(--red-700)",
                    title: "Savings Deposit Reversed — Rs. 2,500",
                    date: "Aug 25, 2026 · 11:05 AM",
                },
            ],
        },
        "M-2023-155": {
            id: "M-2023-155",
            name: "Sanam Shrestha",
            branch: "Lalitpur Branch",
            phone: "+977 9810-XXXXXX",
            email: "sanam.s@example.com",
            address: "Patan, Lalitpur",
            nominee: "Anita Shrestha",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Sep 2023",
            balance: "NPR 2,12,000.00",
            loanStatus: "Active",
            loanChip: "green",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--amber-900)",
                    title: "Withdrawal Requested — Rs. 12,000",
                    date: "Aug 25, 2026 · 8:00 AM",
                },
                {
                    color: "var(--blue-700)",
                    title: "Savings Deposit — Rs. 15,000",
                    date: "Aug 1, 2026 · 9:40 AM",
                },
            ],
        },
        "M-2023-154": {
            id: "M-2023-154",
            name: "Angel Rai",
            branch: "Pokhara Branch",
            phone: "+977 9808-XXXXXX",
            email: "angel.r@example.com",
            address: "Lakeside, Pokhara",
            nominee: "Dipesh Rai",
            citizenship: "XX-XX-XX-XXXXX",
            joined: "Jun 2023",
            balance: "NPR 7,800.00",
            loanStatus: "Overdue",
            loanChip: "red",
            verification: "✓ Verified",
            activity: [
                {
                    color: "var(--blue-700)",
                    title: "New member KYC verification requested",
                    date: "Aug 26, 2026 · 4:00 AM",
                },
            ],
        },
    };

    function getMembers() {
        return load("members", {});
    }
    function getCustomMembers() {
        var obj = getMembers();
        return Object.keys(obj).map(function (k) {
            return obj[k];
        });
    }
    function getMemberById(id) {
        if (!id) return null;
        var custom = getMembers();
        return custom[id] || DEFAULT_MEMBERS[id] || null;
    }
    function addMember(fields) {
        var id = nextId("M-2026");
        var member = {
            id: id,
            name: fields.name || "New Member",
            branch: fields.branch || "—",
            phone: fields.phone || "—",
            email: fields.email || "—",
            address: fields.address || "—",
            nominee: fields.nominee || "—",
            citizenship: "Pending submission",
            joined: new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            }),
            balance:
                "NPR " +
                (parseFloat(fields.deposit || 0) || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                }),
            loanStatus: "None",
            loanChip: "grey",
            verification: "○ Pending",
            scheme: fields.scheme || "Regular Savings",
            activity: [
                {
                    color: "var(--green-700)",
                    title: "Member account created",
                    date: "Just now",
                },
            ],
        };
        var all = getMembers();
        all[id] = member;
        save("members", all);
        return member;
    }

    function addEntry(collection, entry) {
        var list = load(collection, []);
        entry.id = entry.id || nextId(collection.toUpperCase().slice(0, 3));
        entry.createdAt = new Date().toISOString();
        list.unshift(entry);
        save(collection, list);
        return entry;
    }
    function getEntries(collection) {
        return load(collection, []);
    }

    return {
        getMemberById: getMemberById,
        getCustomMembers: getCustomMembers,
        addMember: addMember,
        addEntry: addEntry,
        getEntries: getEntries,
    };
})();
