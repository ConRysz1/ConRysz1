import type { Feature, FeatureGroup } from "./types";

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    "id": "platform",
    "name": "Included in every plan",
    "blurb": "The platform and team every family gets on day one, covered by your base fee of 4 to 6 basis points."
  },
  {
    "id": "fiduciary",
    "name": "Fiduciary roles",
    "blurb": "Vault can take on formal roles for your trusts, billed at the same tiered rates on the assets of those trusts."
  },
  {
    "id": "compliance",
    "name": "Compliance and administration",
    "blurb": "The recurring work that keeps trusts in good standing, coordinated with your CPA and appraisers."
  },
  {
    "id": "family",
    "name": "Family services",
    "blurb": "Support that keeps the next generation informed, involved and ready."
  },
  {
    "id": "partners",
    "name": "For financial partners",
    "blurb": "Tools for the advisors and accountants who work with your family, billed to their firms."
  }
];

export const FEATURES: Feature[] = [
  {
    "id": "structure",
    "g": "platform",
    "name": "Trust and entity map",
    "short": "A live view of every trust, LLC, partnership and beneficiary.",
    "price": "Included",
    "who": "Every family on Vault, from a single dynasty trust to dozens of entities.",
    "inc": [
      "Visual map of trusts, entities, owners and beneficiaries",
      "Assets, trustees and protectors for every trust",
      "History of amendments, decanting and restructuring",
      "Shared view for family members based on their access"
    ],
    "how": [
      "We collect your instruments and entity documents",
      "Our attorneys review them and build your structure",
      "You and your advisors see it live in the portal"
    ],
    "rel": [
      "vault",
      "calendar",
      "trustee"
    ],
    "over": "Most families can’t draw their own structure from memory, and neither can their advisors. Vault turns your trust instruments and entity documents into one live map that everyone with access sees the same way.",
    "ben": [
      [
        "One source of truth",
        "No more spreadsheets and org charts that go stale the day they’re made."
      ],
      [
        "Reviewed by counsel",
        "Our attorneys build the map from your signed documents, not from guesswork."
      ],
      [
        "Ready for every handoff",
        "Successor trustees and heirs inherit a structure they can understand."
      ]
    ],
    "ex": "Included in Essential. A $150M family at 5.5 bps pays $6,875 a month; families under about $60M pay the $3,000 monthly minimum.",
    "pv": {
      "title": "Family structure",
      "rows": [
        [
          "Whitfield Dynasty Trust",
          "$640M · South Dakota"
        ],
        [
          "2026 GRAT",
          "$180M · Delaware"
        ],
        [
          "Whitfield Holdings LLC",
          "$295M · owned by 2 trusts"
        ],
        [
          "Beneficiaries",
          "7 across 3 generations"
        ]
      ]
    },
    "faq": [
      [
        "How long does it take to build my map?",
        "Most families are live within four to six weeks, depending on how many trusts and entities you have."
      ],
      [
        "Who can see the map?",
        "Only the people you approve. Each family member and advisor sees what their access allows."
      ]
    ]
  },
  {
    "id": "vault",
    "g": "platform",
    "name": "Document vault",
    "short": "Instruments, minutes, tax packets and appraisals, versioned and secure.",
    "price": "Included",
    "who": "Families who want one trusted home for every signed document.",
    "inc": [
      "Encrypted storage with version history",
      "Permissions by person, trust and document type",
      "E-signature for minutes and consents",
      "Search across every document"
    ],
    "how": [
      "Upload or send us your existing documents",
      "We organize them by trust and type",
      "Your team adds new documents as they are signed"
    ],
    "rel": [
      "structure",
      "tax",
      "governance"
    ],
    "over": "Signed instruments, amendments, minutes, tax packets and appraisals often live in different offices and inboxes. The document vault keeps every version in one encrypted place, organized by trust.",
    "ben": [
      [
        "Find anything in seconds",
        "Search across every document by trust, type, person or date."
      ],
      [
        "Always the current version",
        "Every amendment is stored with its history, so nothing is overwritten."
      ],
      [
        "Share safely",
        "Grant access by person and trust instead of emailing attachments."
      ]
    ],
    "ex": "Included in your base fee, with no storage limits.",
    "pv": {
      "title": "Recent documents",
      "rows": [
        [
          "Dynasty Trust agreement (restated)",
          "Instrument · Mar 4"
        ],
        [
          "Q3 trustee meeting minutes",
          "Minutes · signed Oct 20"
        ],
        [
          "2025 trust tax packet",
          "Tax · shared with CPA"
        ],
        [
          "Holdings LLC appraisal",
          "Valuation · Feb 2"
        ]
      ]
    },
    "faq": [
      [
        "How is my data protected?",
        "Documents are encrypted in storage and in transit, and every view and download is logged."
      ],
      [
        "Can I e-sign documents?",
        "Yes. Minutes, consents and acknowledgments can be signed in the portal."
      ]
    ]
  },
  {
    "id": "distributions",
    "g": "platform",
    "name": "Distribution workflows",
    "short": "Request, review, approve and record distributions with a full audit trail.",
    "price": "Included",
    "who": "Beneficiaries requesting funds and trustees who need a clear record.",
    "inc": [
      "Online requests with purpose and supporting documents",
      "Trustee review against the trust’s standards",
      "Status updates to the beneficiary at every step",
      "A complete, exportable record for each trust"
    ],
    "how": [
      "A beneficiary submits a request in the portal",
      "The trustee reviews it with our trust officer",
      "Approval, payment and records happen in one place"
    ],
    "rel": [
      "trustee",
      "heirs",
      "structure"
    ],
    "over": "A distribution request should never depend on a phone call or a lost email. Beneficiaries ask in the portal, trustees decide against the trust’s standards, and every step is recorded.",
    "ben": [
      [
        "Faster decisions",
        "Requests arrive complete, with purpose and supporting documents."
      ],
      [
        "Fair and consistent",
        "Every request is reviewed against the same standards in the trust."
      ],
      [
        "A clean record",
        "An audit trail for every distribution, ready for tax and family reviews."
      ]
    ],
    "ex": "Included in your base fee. Typical review time is three business days.",
    "pv": {
      "title": "Distribution requests",
      "rows": [
        [
          "Olivia · medical expenses",
          "$40,000 · in review"
        ],
        [
          "Claire · home purchase",
          "$250,000 · approved"
        ],
        [
          "James · graduate tuition",
          "$60,000 · paid"
        ],
        [
          "Average review time",
          "3 business days"
        ]
      ]
    },
    "faq": [
      [
        "Who approves a request?",
        "The trustee of that trust. If Vault is trustee, our trust officer and counsel review it."
      ],
      [
        "Can a request be withdrawn?",
        "Yes, at any point before the trustee decides."
      ]
    ]
  },
  {
    "id": "calendar",
    "g": "platform",
    "name": "Compliance calendar",
    "short": "Crummey notices, filings, payments and meetings, tracked automatically.",
    "price": "Included",
    "who": "Any family whose trusts carry recurring deadlines.",
    "inc": [
      "Deadlines generated from your trust instruments",
      "Reminders to you and your advisors",
      "Notices prepared and sent by Vault",
      "Annual trustee meeting scheduling"
    ],
    "how": [
      "We read each instrument for its obligations",
      "Deadlines appear on your calendar",
      "We handle Vault-owned items and remind you of yours"
    ],
    "rel": [
      "tax",
      "structure",
      "valuation"
    ],
    "over": "Trusts come with obligations: Crummey notices, annuity payments, filings, valuations and meetings. Miss one and the consequences can be costly. Vault reads each instrument and tracks every deadline for you.",
    "ben": [
      [
        "Nothing slips",
        "Deadlines come straight from your instruments, not from memory."
      ],
      [
        "Clear ownership",
        "Each item shows whether Vault, you or an advisor is responsible."
      ],
      [
        "Reminders that work",
        "Notices go out early, to the right people, every time."
      ]
    ],
    "ex": "Included in your base fee.",
    "pv": {
      "title": "Coming up",
      "rows": [
        [
          "Crummey notices",
          "Nov 15 · Vault"
        ],
        [
          "GRAT annuity payment",
          "Dec 1 · Vault"
        ],
        [
          "Annual trustee meeting",
          "Dec 15 · family and Vault"
        ],
        [
          "Tax packet to CPA",
          "Mar 15 · Vault"
        ]
      ]
    },
    "faq": [
      [
        "What if a deadline is mine, not Vault’s?",
        "It’s marked for you, and we remind you ahead of time."
      ],
      [
        "Can my advisors see the calendar?",
        "Yes, if you give them access."
      ]
    ]
  },
  {
    "id": "heirs",
    "g": "platform",
    "name": "Beneficiary portal",
    "short": "Secure access for every family member, matched to their role and age.",
    "price": "Included",
    "who": "Grantors, beneficiaries and successor trustees across generations.",
    "inc": [
      "Individual logins with role-based access",
      "Statements and documents for each beneficiary",
      "Distribution requests and status",
      "Mobile access"
    ],
    "how": [
      "You choose who sees what",
      "Each person gets their own secure login",
      "Access changes as roles and ages change"
    ],
    "rel": [
      "nextgen",
      "distributions",
      "governance"
    ],
    "over": "Every family member has a different role and a different need to know. The beneficiary portal gives each person their own secure login, with access that matches their role and grows with them.",
    "ben": [
      [
        "The right view for each person",
        "Grantors, beneficiaries and successor trustees each see what fits their role."
      ],
      [
        "Fewer calls and emails",
        "Statements, documents and requests are always available."
      ],
      [
        "Ready for succession",
        "Successor trustees get familiar with the trust before they need to act."
      ]
    ],
    "ex": "Included for every family member. Education access for younger heirs is a next-generation seat.",
    "pv": {
      "title": "Family access",
      "rows": [
        [
          "Eleanor · grantor",
          "Full access"
        ],
        [
          "James · successor trustee",
          "Full access"
        ],
        [
          "Henry · age 19",
          "Education access"
        ],
        [
          "Leo · age 12",
          "Not yet invited"
        ]
      ]
    },
    "faq": [
      [
        "Can I change someone’s access?",
        "Yes, at any time from Heirs and access in the portal."
      ],
      [
        "Is there a mobile app?",
        "The portal works on any phone or tablet browser."
      ]
    ]
  },
  {
    "id": "team",
    "g": "platform",
    "name": "Dedicated team",
    "short": "A relationship lead, trust counsel, trust officer and service associate.",
    "price": "Included",
    "who": "Families who want named people, not a call center.",
    "inc": [
      "A relationship lead as your first call",
      "In-house trust and estate counsel",
      "A trust officer for distributions and trustee decisions",
      "Messaging with your team in the portal"
    ],
    "how": [
      "We introduce your team at onboarding",
      "Your team learns your family and structure",
      "They stay with your family as it grows"
    ],
    "rel": [
      "trustee",
      "governance",
      "structure"
    ],
    "over": "Behind the software is a named team that knows your family: a relationship lead, trust counsel, a trust officer and a service associate. They stay with you as your family and structure grow.",
    "ben": [
      [
        "Named people",
        "You know who handles what, and they know your family."
      ],
      [
        "Legal judgment built in",
        "In-house counsel reviews instruments and advises on decisions."
      ],
      [
        "Continuity",
        "Your team carries knowledge forward, so nothing resets when people change."
      ]
    ],
    "ex": "Included in your base fee.",
    "pv": {
      "title": "Your Vault team",
      "rows": [
        [
          "Relationship lead",
          "First call for anything"
        ],
        [
          "Trust counsel",
          "Instruments and legal questions"
        ],
        [
          "Trust officer",
          "Distributions and trustee decisions"
        ],
        [
          "Client service",
          "Documents, access and billing"
        ]
      ]
    },
    "faq": [
      [
        "How do I reach my team?",
        "Message them in the portal or call your relationship lead directly."
      ],
      [
        "Does my team change over time?",
        "Your team is assigned for the long term. If someone changes, we hand over your file in full."
      ]
    ]
  },
  {
    "id": "trustee",
    "g": "fiduciary",
    "name": "Serving as trustee",
    "short": "Vault serves as legal trustee and is accountable for the trust.",
    "price": "Tier bps on trust assets · from $2,500/mo",
    "who": "Families who want an independent, professional trustee with continuity across generations.",
    "inc": [
      "Legal title and fiduciary responsibility for the trust",
      "Distribution decisions under the trust’s standards",
      "Annual trustee reporting and meetings",
      "Coordination with your investment advisor, who keeps managing the assets"
    ],
    "how": [
      "We review the trust and accept the appointment",
      "Assets stay with your custodian and advisor",
      "Vault acts as trustee day to day"
    ],
    "note": "Trustee services are subject to Vault’s trust charter approval.",
    "rel": [
      "protector",
      "distributions",
      "team"
    ],
    "over": "Choosing a trustee is one of the most important decisions in any estate plan. Vault can serve as a professional, independent trustee, combining fiduciary judgment with software that keeps every decision documented.",
    "ben": [
      [
        "Independence",
        "A neutral trustee reduces family conflict and strengthens the trust."
      ],
      [
        "Continuity across generations",
        "No dependence on one individual’s health, schedule or memory."
      ],
      [
        "Your advisor stays in place",
        "Assets remain with your custodian and investment advisor."
      ]
    ],
    "ex": "A $640M dynasty trust at 4.5 bps is $24,000 a month. A $40M life insurance trust pays the $2,500 monthly minimum.",
    "pv": {
      "title": "Trustee activity",
      "rows": [
        [
          "Trusts under Vault as trustee",
          "3"
        ],
        [
          "Distributions decided this year",
          "4"
        ],
        [
          "Annual trustee meeting",
          "Dec 15"
        ],
        [
          "Fiduciary insurance",
          "In force"
        ]
      ]
    },
    "faq": [
      [
        "Do I have to move my investments?",
        "No. Vault can act as a directed trustee while your advisor keeps managing the assets."
      ],
      [
        "When can Vault serve as trustee?",
        "Trustee services are subject to Vault’s trust charter approval. Until then, we work alongside a partner trust company."
      ]
    ]
  },
  {
    "id": "protector",
    "g": "fiduciary",
    "name": "Trust protector",
    "short": "Independent oversight that can replace trustees or update terms as laws change.",
    "price": "Tier bps on trust assets · from $5,000/mo",
    "who": "Long-lived dynasty trusts that need a safeguard over decades.",
    "inc": [
      "Power to remove and replace trustees",
      "Changes to trust location (situs) when helpful",
      "Updates to administrative terms as laws change",
      "An annual review of the trust and its trustees"
    ],
    "how": [
      "We review the instrument and the protector’s powers",
      "We accept the role and set an annual review",
      "We act only when the trust needs it"
    ],
    "rel": [
      "trustee",
      "structure",
      "governance"
    ],
    "over": "A dynasty trust can last for generations, but laws, families and trustees change. A trust protector is an independent safeguard with the power to adjust the trust when it truly needs it.",
    "ben": [
      [
        "A check on the trustee",
        "The power to remove and replace a trustee who isn’t serving the family."
      ],
      [
        "Flexibility for decades",
        "Update administrative terms or move the trust as laws change."
      ],
      [
        "Independent judgment",
        "A professional protector, separate from the family and the trustee."
      ]
    ],
    "ex": "A $300M trust at 5 bps is $12,500 a month. Trusts under $100M pay the $5,000 monthly minimum.",
    "pv": {
      "title": "Protector review",
      "rows": [
        [
          "Trust",
          "Whitfield Dynasty Trust"
        ],
        [
          "Powers",
          "Replace trustee, change situs, amend admin terms"
        ],
        [
          "Last annual review",
          "Sep 2026"
        ],
        [
          "Actions taken",
          "None needed"
        ]
      ]
    },
    "faq": [
      [
        "Does my trust allow a protector?",
        "Many modern trusts do. Our counsel will review your instrument and tell you."
      ],
      [
        "How often does the protector act?",
        "Rarely. Most years the protector reviews and confirms everything is working."
      ]
    ]
  },
  {
    "id": "tax",
    "g": "compliance",
    "name": "Trust tax coordination",
    "short": "Each trust’s tax data and K-1 inputs, organized and delivered to your CPA.",
    "price": "$350/mo per trust",
    "who": "Families with several trusts and a CPA who prepares the returns.",
    "inc": [
      "A year-end tax data packet for every trust",
      "Beneficiary K-1 inputs",
      "Secure delivery to your CPA through Vault",
      "Deadline tracking for estimates and filings"
    ],
    "how": [
      "We gather each trust’s activity during the year",
      "We prepare the packet for your CPA",
      "Your CPA prepares and files the returns"
    ],
    "rel": [
      "cpa",
      "calendar",
      "vault"
    ],
    "over": "Trust tax season usually means chasing statements and spreadsheets across several institutions. Vault gathers each trust’s activity during the year and delivers a complete packet to your CPA, who prepares and files the returns.",
    "ben": [
      [
        "A calmer tax season",
        "Your CPA gets everything at once, organized by trust."
      ],
      [
        "Fewer errors",
        "Data comes straight from the platform, not from manual re-keying."
      ],
      [
        "Your CPA stays your CPA",
        "We coordinate the work; your accountant prepares and files."
      ]
    ],
    "ex": "5 trusts × $350 = $1,750 a month ($21,000 a year).",
    "pv": {
      "title": "Tax packet status",
      "rows": [
        [
          "Whitfield Dynasty Trust",
          "Ready for CPA"
        ],
        [
          "2026 GRAT",
          "Ready for CPA"
        ],
        [
          "Charitable Remainder Trust",
          "Awaiting statement"
        ],
        [
          "Delivery to Ortiz & Co.",
          "Mar 15"
        ]
      ]
    },
    "faq": [
      [
        "Does Vault prepare tax returns?",
        "No. We prepare the data and K-1 inputs; your CPA prepares and files."
      ],
      [
        "Can my CPA log in?",
        "Yes, with a CPA firm seat billed to their firm."
      ]
    ]
  },
  {
    "id": "entities",
    "g": "compliance",
    "name": "Additional entities",
    "short": "Five trusts or LLCs included; add more as your structure grows.",
    "price": "$200/mo each after five",
    "who": "Families with larger structures: holding companies, partnerships and multiple trusts.",
    "inc": [
      "Full tracking for each additional trust or LLC",
      "Owners, documents and deadlines in one place",
      "Included in your structure map"
    ],
    "how": [
      "Tell us about a new entity",
      "We add its documents and obligations",
      "It appears in your map and calendar"
    ],
    "rel": [
      "structure",
      "calendar",
      "valuation"
    ],
    "over": "Family structures grow: a new LLC for a real estate purchase, a new trust for a grandchild. Every Vault plan includes five trusts or entities, and adding more is simple.",
    "ben": [
      [
        "Room to grow",
        "Add entities as your structure changes, without renegotiating."
      ],
      [
        "Everything connected",
        "Each new entity joins your map, vault and calendar automatically."
      ],
      [
        "Simple pricing",
        "One flat monthly price per entity beyond five."
      ]
    ],
    "ex": "A family with 8 entities pays for 3 beyond the 5 included: 3 × $200 = $600 a month.",
    "pv": {
      "title": "Entities on Vault",
      "rows": [
        [
          "Included in plan",
          "5"
        ],
        [
          "Currently tracked",
          "5"
        ],
        [
          "Additional entities",
          "0"
        ],
        [
          "Next addition",
          "Florida real estate LLC (planned)"
        ]
      ]
    },
    "faq": [
      [
        "What counts as an entity?",
        "Any trust, LLC, partnership or corporation we track for your family."
      ],
      [
        "Is there a limit?",
        "No. Some families have dozens."
      ]
    ]
  },
  {
    "id": "valuation",
    "g": "compliance",
    "name": "Valuation support",
    "short": "The appraisals needed for gifting, GRATs and estate planning, managed for you.",
    "price": "$583/mo per appraised asset",
    "who": "Families holding private businesses, real estate or family LLC interests.",
    "inc": [
      "Annual appraisal scheduling with qualified appraisers",
      "Document collection for the appraiser",
      "Results stored and linked to the right trust",
      "Coordination with your attorney and CPA"
    ],
    "how": [
      "We identify assets that need a valuation",
      "We manage the appraiser and timeline",
      "Reports land in your vault on schedule"
    ],
    "rel": [
      "tax",
      "entities",
      "calendar"
    ],
    "over": "Gifts, GRATs and estate planning often depend on independent appraisals of private businesses, real estate and family LLC interests. Vault manages the appraisers, the documents and the timeline so valuations arrive on schedule.",
    "ben": [
      [
        "On time, every year",
        "Appraisals are scheduled around your planning and filing deadlines."
      ],
      [
        "Less work for you",
        "We collect documents and answer the appraiser’s questions."
      ],
      [
        "Stored where it matters",
        "Each report is linked to the right trust and shared with your advisors."
      ]
    ],
    "ex": "2 appraised assets × $583 = $1,166 a month (about $14,000 a year), plus the appraiser’s own fee.",
    "pv": {
      "title": "Valuations",
      "rows": [
        [
          "Whitfield Holdings LLC",
          "Due Jan 31"
        ],
        [
          "Appraiser",
          "Engaged"
        ],
        [
          "Documents requested",
          "6 of 7 received"
        ],
        [
          "Last report",
          "Feb 2, 2026"
        ]
      ]
    },
    "faq": [
      [
        "Is the appraiser’s fee included?",
        "No. Appraisers bill separately; we manage them on your behalf."
      ],
      [
        "Which assets need valuations?",
        "Usually private businesses, real estate and family entity interests used in gifting or estate planning."
      ]
    ]
  },
  {
    "id": "governance",
    "g": "family",
    "name": "Family governance",
    "short": "Annual family meetings, a family charter and decision support across generations.",
    "price": "$3,500/mo",
    "who": "Families preparing heirs to share decisions and responsibility.",
    "inc": [
      "A facilitated annual family meeting",
      "A written family charter, kept current",
      "Decision frameworks for distributions and roles",
      "Onboarding for new family members and spouses"
    ],
    "how": [
      "We interview family members",
      "We draft your charter together",
      "We run the meeting each year and update the charter"
    ],
    "rel": [
      "nextgen",
      "heirs",
      "charitable"
    ],
    "over": "Wealth that lasts for generations depends on a family that can make decisions together. Vault facilitates an annual family meeting, maintains a written family charter and helps you set clear frameworks for shared decisions.",
    "ben": [
      [
        "A shared playbook",
        "A family charter that sets out values, roles and how decisions get made."
      ],
      [
        "Heirs who are ready",
        "Younger generations learn the structure before they inherit it."
      ],
      [
        "Fewer surprises",
        "Expectations around distributions and roles are discussed openly."
      ]
    ],
    "ex": "$3,500 a month ($42,000 a year), including the annual family meeting.",
    "pv": {
      "title": "Family governance",
      "rows": [
        [
          "Family charter",
          "Draft v2 · Sep 12"
        ],
        [
          "Annual meeting",
          "Dec 15 · 11 attending"
        ],
        [
          "Agenda",
          "Distribution policy, successor trustee"
        ],
        [
          "New members onboarded",
          "2 spouses this year"
        ]
      ]
    },
    "faq": [
      [
        "Who attends the family meeting?",
        "Whoever you choose: typically adult family members, trustees and advisors."
      ],
      [
        "Is the charter legally binding?",
        "It’s a guiding document, not a legal instrument, but it shapes how your trustees and family work together."
      ]
    ]
  },
  {
    "id": "charitable",
    "g": "family",
    "name": "Charitable vehicles",
    "short": "Foundations, donor-advised funds and charitable trusts, run for you.",
    "price": "$1,000/mo per vehicle",
    "who": "Families giving through a foundation, donor-advised fund or charitable trust.",
    "inc": [
      "Administration of each charitable vehicle",
      "Grant tracking and records",
      "Required filings coordinated with your CPA",
      "Involving the next generation in giving decisions"
    ],
    "how": [
      "We take over administration of the vehicle",
      "Grants and payments run through Vault",
      "Filings are prepared on schedule"
    ],
    "rel": [
      "governance",
      "tax",
      "structure"
    ],
    "over": "Foundations, donor-advised funds and charitable trusts take real work to run well. Vault handles the administration, grant records and required filings, and helps involve the next generation in your family’s giving.",
    "ben": [
      [
        "Giving without the paperwork",
        "We handle administration so you can focus on the causes you care about."
      ],
      [
        "Clean records",
        "Every grant and payment tracked, ready for filings and reviews."
      ],
      [
        "A shared family legacy",
        "Bring younger family members into giving decisions."
      ]
    ],
    "ex": "A foundation and a donor-advised fund: 2 × $1,000 = $2,000 a month.",
    "pv": {
      "title": "Charitable vehicles",
      "rows": [
        [
          "Charitable Remainder Trust",
          "Unitrust payment Jul 1"
        ],
        [
          "Whitfield Foundation",
          "12 grants this year"
        ],
        [
          "Filings",
          "Coordinated with your CPA"
        ],
        [
          "Next board meeting",
          "Jan 2027"
        ]
      ]
    },
    "faq": [
      [
        "Can you set up a new foundation?",
        "Yes, working with your attorney and CPA, and we can run it from day one."
      ],
      [
        "Who prepares the foundation’s tax return?",
        "Your CPA, using records we keep on the platform."
      ]
    ]
  },
  {
    "id": "nextgen",
    "g": "family",
    "name": "Next-generation seats",
    "short": "Portal access and financial education for younger heirs.",
    "price": "2 included · $150/mo per heir after",
    "who": "Grandchildren and younger heirs who will one day inherit.",
    "inc": [
      "Age-appropriate portal access",
      "Financial education sessions and materials",
      "A gradual path to full access",
      "Introductions to your Vault team"
    ],
    "how": [
      "You choose which heirs get a seat",
      "They get their own education login",
      "Access grows as they reach milestones"
    ],
    "rel": [
      "heirs",
      "governance",
      "team"
    ],
    "over": "The most common reason families lose wealth is that heirs aren’t prepared to receive it. Next-generation seats give younger family members age-appropriate access and financial education long before they inherit.",
    "ben": [
      [
        "Prepared heirs",
        "Education that builds understanding of trusts, taxes and responsibility."
      ],
      [
        "Access that grows",
        "Start with education, move to full access at milestones you choose."
      ],
      [
        "A relationship with Vault",
        "Heirs get to know the team that will serve them."
      ]
    ],
    "ex": "Two seats are included with Essential. A third grandchild is $150 a month.",
    "pv": {
      "title": "Next-generation seats",
      "rows": [
        [
          "Henry · age 19",
          "Module 3 of 6"
        ],
        [
          "Ava · age 16",
          "Module 1 of 6"
        ],
        [
          "Next session",
          "Understanding your trust"
        ],
        [
          "Full access at",
          "Age 25 (family policy)"
        ]
      ]
    },
    "faq": [
      [
        "What age is right to start?",
        "Many families start in the mid-teens. You decide."
      ],
      [
        "Can heirs see balances?",
        "Only if you allow it. Education access shows concepts, not your family’s numbers."
      ]
    ]
  },
  {
    "id": "advisor",
    "g": "partners",
    "name": "Advisor seats",
    "short": "Vault logins for advisors at wealth managers, banks and RIAs.",
    "price": "$650/mo per seat · billed to the firm",
    "who": "Investment advisors who serve families on Vault.",
    "inc": [
      "A view of each client family’s trusts and deadlines",
      "Distribution and document updates",
      "Messaging with the Vault team",
      "No change to your investment relationship"
    ],
    "how": [
      "Your firm signs a partner agreement",
      "Advisors get their own logins",
      "Families grant each advisor access"
    ],
    "rel": [
      "cpa",
      "trustee",
      "structure"
    ],
    "over": "Wealth managers, private banks and RIAs can give their advisors a direct view into each client family’s trusts, documents and deadlines, without giving up the investment relationship.",
    "ben": [
      [
        "Stronger client service",
        "See trust activity alongside your investment work."
      ],
      [
        "No competition for assets",
        "Vault doesn’t manage money, hold custody or sell products."
      ],
      [
        "Less coordination",
        "Updates flow to you instead of through email chains."
      ]
    ],
    "ex": "A 20-advisor firm: 20 × $650 = $13,000 a month, billed to the firm.",
    "pv": {
      "title": "Advisor view",
      "rows": [
        [
          "Client families on Vault",
          "14"
        ],
        [
          "Distributions awaiting decision",
          "3"
        ],
        [
          "Deadlines this month",
          "9"
        ],
        [
          "Messages from Vault team",
          "2 new"
        ]
      ]
    },
    "faq": [
      [
        "Who pays for advisor seats?",
        "The partner firm. Families never pay for their advisors’ seats."
      ],
      [
        "What can an advisor see?",
        "Only what each family approves in their settings."
      ]
    ]
  },
  {
    "id": "cpa",
    "g": "partners",
    "name": "CPA firm seats",
    "short": "Secure access to the trust data your firm needs for returns.",
    "price": "$450/mo per seat · billed to the firm",
    "who": "CPA and accounting firms that prepare returns for families on Vault.",
    "inc": [
      "Year-end tax packets delivered in the portal",
      "K-1 inputs for each beneficiary",
      "Document access by trust",
      "Deadline visibility for filings"
    ],
    "how": [
      "Your firm joins as a partner",
      "Accountants get their own logins",
      "Families connect their CPA in settings"
    ],
    "rel": [
      "tax",
      "advisor",
      "vault"
    ],
    "over": "CPA and accounting firms preparing trust returns can get secure access to the data they need: year-end packets, K-1 inputs and documents, organized by trust.",
    "ben": [
      [
        "Everything in one place",
        "No more chasing statements across institutions."
      ],
      [
        "Cleaner returns",
        "Data comes directly from the platform."
      ],
      [
        "We send work your way",
        "Vault refers tax preparation to partner CPA firms."
      ]
    ],
    "ex": "A 5-accountant team: 5 × $450 = $2,250 a month, billed to the firm.",
    "pv": {
      "title": "CPA view",
      "rows": [
        [
          "Client families",
          "9"
        ],
        [
          "Tax packets ready",
          "21 of 26 trusts"
        ],
        [
          "K-1 inputs delivered",
          "48"
        ],
        [
          "Filing deadline",
          "Apr 15"
        ]
      ]
    },
    "faq": [
      [
        "Will Vault prepare returns instead of us?",
        "No. Vault coordinates the data; your firm prepares and files."
      ],
      [
        "Who pays for CPA seats?",
        "The CPA firm, not the family."
      ]
    ]
  }
];
