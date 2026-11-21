// Question bank for the study hub. Edit here; solo and team mode both read it.
// Card Sort rows: [type, item, answer, why]. Answer is Taxable, Excluded, Deductible or Not deductible.
// Two Truths rows: [topic, [three statements], lieIndex, why].
// Jeopardy clues: [question, [correct answer first, then 3 wrong ones], why]. Options are shuffled when shown.
window.BANK_DATA = {
 "cards": [
  [
   "Income",
   "$50,000 inheritance from a grandmother",
   "Excluded",
   "Inheritances are excluded."
  ],
  [
   "Income",
   "Interest on a City of Spokane municipal bond",
   "Excluded",
   "Interest on state and local government bonds is exempt."
  ],
  [
   "Income",
   "Interest the state pays on your income tax overpayment",
   "Taxable",
   "Only state/local bond interest is exempt. Interest on a tax overpayment is fully taxable."
  ],
  [
   "Income",
   "Grad assistant's $400/month for teaching a course",
   "Taxable",
   "A stipend for services is compensation."
  ],
  [
   "Income",
   "Scholarship spent on required textbooks",
   "Excluded",
   "Required books, supplies and equipment qualify along with tuition."
  ],
  [
   "Income",
   "Scholarship spent on a dorm room and meal plan",
   "Taxable",
   "Room and board isn't a qualified expense."
  ],
  [
   "Income",
   "$100 holiday gift card from your employer",
   "Taxable",
   "Cash and gift cards are never de minimis."
  ],
  [
   "Income",
   "Punitive damages from a car accident",
   "Taxable",
   "All punitive damages are taxable."
  ],
  [
   "Income",
   "Compensatory damages, including lost wages, for a broken leg",
   "Excluded",
   "Physical injury, so it's excluded, lost wages included."
  ],
  [
   "Income",
   "Damages for emotional distress from defamation (no physical injury)",
   "Taxable",
   "Nonphysical personal injury damages are taxable."
  ],
  [
   "Income",
   "Health insurance premiums your employer pays for you",
   "Excluded",
   "Employer-paid accident and health premiums are excluded."
  ],
  [
   "Income",
   "Life insurance proceeds after a parent's death",
   "Excluded",
   "Death proceeds paid to a beneficiary are excluded."
  ],
  [
   "Income",
   "Hotel employee stays free in a room that would otherwise sit empty",
   "Excluded",
   "No-additional-cost service, offered in the employer's line of business."
  ],
  [
   "Income",
   "Occasional supper money for working overtime",
   "Excluded",
   "A de minimis fringe."
  ],
  [
   "Income",
   "Employer-paid group-term life insurance on $50,000 of coverage",
   "Excluded",
   "Group-term life coverage up to $50,000 is excluded."
  ],
  [
   "Income",
   "Employer pays for your night-class tuition under an educational assistance plan, within the limit",
   "Excluded",
   "Educational assistance programs are an excluded fringe up to the limit."
  ],
  [
   "Income",
   "Employer-provided transit pass, within the monthly limit",
   "Excluded",
   "A qualified transportation fringe."
  ],
  [
   "Income",
   "Store clerk's employee discount on store merchandise, within the limit",
   "Excluded",
   "A qualified employee discount."
  ],
  [
   "Income",
   "Employer pays for a professional journal you use for your job",
   "Excluded",
   "A working condition fringe: you could have deducted it yourself."
  ],
  [
   "Income",
   "Employer-provided cell phone, issued for business with some personal use",
   "Excluded",
   "Provided for business reasons; personal use is de minimis."
  ],
  [
   "Income",
   "Occasional personal use of the office copier",
   "Excluded",
   "A de minimis fringe."
  ],
  [
   "Income",
   "Hotel manager required to live on the premises for the employer's convenience",
   "Excluded",
   "On the premises, for the employer's convenience, and a condition of employment."
  ],
  [
   "Income",
   "Cash dividends on your corporate stock",
   "Taxable",
   "Cash distributions out of earnings and profits are dividends."
  ],
  [
   "Income",
   "Common stock received as a dividend on your common stock",
   "Excluded",
   "Stock dividends are generally not taxable."
  ],
  [
   "Income",
   "Your bank forgives $8,000 of your car loan",
   "Taxable",
   "Income from discharge of indebtedness is generally taxable."
  ],
  [
   "Income",
   "Interest on a U.S. Treasury bond",
   "Taxable",
   "Only state and local bond interest is exempt."
  ],
  [
   "Income",
   "Benefits from a disability policy you bought yourself",
   "Excluded",
   "Accident and health benefits from a policy you paid for are excluded."
  ],
  [
   "Income",
   "Employer pays your regular salary while you're out sick",
   "Taxable",
   "Payments that substitute for salary are included."
  ],
  [
   "Expense",
   "Rent on a sole proprietor's office",
   "Deductible",
   "Ordinary and necessary trade or business expense."
  ],
  [
   "Expense",
   "Legal fees defending a lawsuit from a customer",
   "Deductible",
   "Related to the business, so ordinary and necessary."
  ],
  [
   "Expense",
   "The lobbying share of trade association dues",
   "Not deductible",
   "Lobbying costs are disallowed."
  ],
  [
   "Expense",
   "Cash-method business: salaries owed but unpaid at year-end",
   "Not deductible",
   "Under the cash method, only amounts actually paid are deducted."
  ],
  [
   "Expense",
   "A sole proprietor's monthly draw for living expenses",
   "Not deductible",
   "Personal, not wages."
  ],
  [
   "Expense",
   "Health insurance premiums paid by a self-employed person",
   "Deductible",
   "A deduction for AGI."
  ],
  [
   "Expense",
   "Contribution to a health savings account",
   "Deductible",
   "A deduction for AGI."
  ],
  [
   "Expense",
   "Penalty for cashing in a CD early",
   "Deductible",
   "A deduction for AGI."
  ],
  [
   "Expense",
   "Kickback paid for Medicare patient referrals",
   "Not deductible",
   "Bribes and kickbacks violate public policy."
  ],
  [
   "Expense",
   "Paying your adult son's property tax on his house",
   "Not deductible",
   "You can't deduct an expense that's another taxpayer's obligation."
  ],
  [
   "Expense",
   "Buying a building for your business (this year's deduction)",
   "Not deductible",
   "A capital expenditure: it's capitalized, not deducted currently."
  ],
  [
   "Expense",
   "Dentist's $3,000 city fine for improper waste disposal",
   "Not deductible",
   "Public policy: fines paid to a government."
  ],
  [
   "Expense",
   "Campaign contribution to a state senator who backs your industry",
   "Not deductible",
   "Political contributions aren't deductible."
  ],
  [
   "Expense",
   "Dentist spends $6,000 investigating another dental practice",
   "Deductible",
   "Same line of business, so investigation costs are deductible."
  ],
  [
   "Expense",
   "Loss on selling stock to your sister",
   "Not deductible",
   "Related-party losses are disallowed."
  ],
  [
   "Expense",
   "Bribe paid to a city inspector",
   "Not deductible",
   "Bribes and kickbacks violate public policy."
  ],
  [
   "Expense",
   "Interest on a student loan",
   "Deductible",
   "A common deduction for AGI."
  ],
  [
   "Expense",
   "Groceries and clothing for your family",
   "Not deductible",
   "Personal, living and family expenses are disallowed."
  ],
  [
   "Expense",
   "Interest on a loan used to buy tax-exempt municipal bonds",
   "Not deductible",
   "Expenses tied to tax-exempt income are disallowed."
  ],
  [
   "Expense",
   "Contribution to a traditional IRA, within the annual limit",
   "Deductible",
   "A deduction for AGI, subject to annual limits."
  ]
 ],
 "lies": [
  [
   "Gifts",
   [
    "Inheritances are excluded from gross income.",
    "Interest earned on a gifted bond is taxable to the person who received it.",
    "A cash gift from your employer is excluded if it was given purely out of generosity."
   ],
   2,
   "Transfers from an employer to an employee aren't excludable gifts."
  ],
  [
   "Scholarships",
   [
    "A scholarship used for required textbooks is excluded.",
    "A scholarship used for room and board is excluded.",
    "A teaching assistant's stipend is taxable compensation."
   ],
   1,
   "Room and board isn't a qualified expense, so that part is taxable."
  ],
  [
   "Damages",
   [
    "Punitive damages are always taxable.",
    "Damages for emotional distress alone, with no physical injury, are excluded.",
    "Lost wages tied to a physical injury are excluded."
   ],
   1,
   "Nonphysical injury damages are taxable, like Paul's mother's $25,000."
  ],
  [
   "Fringe benefits",
   [
    "Cash and gift cards are never de minimis fringes.",
    "Health insurance premiums paid by your employer are excluded.",
    "Meals are excluded any time the employer pays for them."
   ],
   2,
   "They must be on the business premises and for the employer's convenience."
  ],
  [
   "Interest",
   [
    "Interest on state and local government bonds is exempt.",
    "Interest the state pays on your tax overpayment is exempt.",
    "Life insurance death proceeds paid to a beneficiary are excluded."
   ],
   1,
   "Only state and local bond interest is exempt. Interest on an overpayment is fully taxable."
  ],
  [
   "Classifying deductions",
   [
    "Deductions for AGI count even if you take the standard deduction.",
    "Student loan interest is a deduction for AGI.",
    "Itemized deductions reduce your tax even when they total less than the standard deduction."
   ],
   2,
   "Itemized deductions help only if they exceed the standard deduction."
  ],
  [
   "Disallowed",
   [
    "Fines paid to a government aren't deductible.",
    "Political contributions are deductible if they help your business.",
    "Bribes and kickbacks aren't deductible."
   ],
   1,
   "Political contributions are never deductible, as Dr. Payne found out."
  ],
  [
   "Timing",
   [
    "A cash-method taxpayer deducts an expense when it's paid.",
    "An accrual-method taxpayer deducts an expense when it's incurred.",
    "A cash-method taxpayer can deduct salaries owed but unpaid at year-end."
   ],
   2,
   "Unpaid salaries wait until paid, like Dr. Payne's $5,000."
  ],
  [
   "Related parties",
   [
    "A loss on selling stock to your brother is disallowed.",
    "A loss on selling stock to your cousin is disallowed under the related-party rules.",
    "Your grandparents count as related parties."
   ],
   1,
   "Cousins aren't on the list: siblings, spouse, ancestors and lineal descendants are."
  ],
  [
   "Life insurance",
   [
    "Death proceeds paid to a beneficiary are excluded.",
    "Interest earned on proceeds left with the insurer is taxable.",
    "Once you buy someone else's policy, all the death proceeds are excluded."
   ],
   2,
   "A policy transferred for valuable consideration loses the full exclusion."
  ],
  [
   "Stock dividends",
   [
    "Cash dividends are taxable.",
    "Common stock received as a dividend on common stock is generally not taxable.",
    "Every stock dividend is taxable when received."
   ],
   2,
   "Stock dividends are generally nontaxable."
  ],
  [
   "Debt",
   [
    "Forgiveness of debt is generally taxable.",
    "When a bank forgives part of your loan, it's excluded as a gift.",
    "Interest on a U.S. Treasury bond is taxable."
   ],
   1,
   "A bank isn't acting out of generosity. Discharge of debt is income."
  ],
  [
   "Fringe types",
   [
    "A no-additional-cost service costs the employer nothing substantial to provide.",
    "Qualified employee discounts don't apply to real estate.",
    "A working condition fringe covers items you couldn't deduct if you paid for them yourself."
   ],
   2,
   "It's the opposite: it covers items you could have deducted yourself."
  ],
  [
   "Meals and lodging",
   [
    "Lodging must be accepted as a condition of employment.",
    "Meals must be furnished on the business premises.",
    "A cash meal allowance added to your paycheck is excluded as employer-provided meals."
   ],
   2,
   "The exclusion is for meals actually furnished, not cash."
  ],
  [
   "Accident and health",
   [
    "Benefits from a health policy you bought yourself are excluded.",
    "Health premiums your employer pays are excluded.",
    "Payments that replace your salary while you're out sick are excluded."
   ],
   2,
   "Payments that substitute for salary are taxable."
  ],
  [
   "§ 162 tests",
   [
    "Ordinary means normal or customary in that type of business.",
    "Necessary means a prudent businessperson would incur it.",
    "If an expense is unreasonable, the entire expense is disallowed."
   ],
   2,
   "Only the unreasonable excess is disallowed."
  ],
  [
   "Whose expense?",
   [
    "Buying a business building is capitalized, not deducted right away.",
    "A sole proprietor's draw isn't deductible.",
    "You can deduct your adult son's property taxes if you pay them."
   ],
   2,
   "No deduction for an expense that's another taxpayer's obligation."
  ],
  [
   "Investigation costs",
   [
    "If you're in the same business, investigation costs are deductible whether or not you buy.",
    "If you're in a different business and don't buy, the costs aren't deductible.",
    "If you buy the new business, startup costs over $5,000 are never deductible."
   ],
   2,
   "The excess is amortized over at least 180 months."
  ],
  [
   "Lobbying",
   [
    "The lobbying share of association dues isn't deductible.",
    "Legal fees to defend a business lawsuit are deductible.",
    "Dues to a professional society are always fully deductible."
   ],
   2,
   "Dr. Payne could deduct only the 30% not tied to lobbying."
  ]
 ],
 "jeopardy": {
  "cats": [
   {
    "name": "Gifts & Life Insurance",
    "clues": [
     [
      "Is an inheritance taxable to the beneficiary?",
      [
       "No, it's excluded",
       "Yes, it's fully taxable",
       "Only the part over $15,000",
       "Only if it's paid in cash"
      ],
      "Inheritances are excluded from gross income."
     ],
     [
      "Dad gifts his daughter a corporate bond. Who's taxed on the interest earned after the gift?",
      [
       "The daughter",
       "Dad",
       "Neither of them",
       "They split it 50/50"
      ],
      "The gift itself is excluded, but income earned on it afterward is the daughter's."
     ],
     [
      "Paul's summer employer gives him an unplanned extra payment and calls it a \"gift.\" Is it excludable?",
      [
       "No, it's compensation",
       "Yes, it's a gift",
       "Yes, if it's under $1,000",
       "Only half is taxable"
      ],
      "Transfers from an employer to an employee aren't excludable gifts."
     ],
     [
      "Life insurance proceeds are left with the insurer and earn interest. Is the interest taxable?",
      [
       "Yes, the interest is taxable",
       "No, it's part of the death benefit",
       "Only if it's over $10,000",
       "No, the insurer pays that tax"
      ],
      "The death proceeds are excluded, but earnings from reinvesting them are taxable."
     ],
     [
      "Why does Congress exclude life insurance death proceeds?",
      [
       "They work much like a nontaxable inheritance",
       "The insurer already paid tax on them",
       "The premiums were already deducted",
       "To encourage people to buy bonds"
      ],
      "Death proceeds serve much the same purpose as an inheritance and replace an economic loss."
     ]
    ]
   },
   {
    "name": "Scholarships & Damages",
    "clues": [
     [
      "A scholarship used for room and board is:",
      [
       "Taxable",
       "Excluded",
       "Deductible",
       "Excluded up to $5,000"
      ],
      "Only tuition, required fees, books, supplies and equipment are excluded."
     ],
     [
      "Paul gets $400 a month for teaching a principles course. It's:",
      [
       "Taxable compensation",
       "An excluded scholarship",
       "An excluded fringe benefit",
       "Taxable only in the summer"
      ],
      "It's pay for services, even though he got the assistantship on merit."
     ],
     [
      "Paul's $6,000 graduate tuition waiver is:",
      [
       "Excluded",
       "Taxable",
       "Half taxable",
       "Deductible"
      ],
      "Waivers are generally for undergrads, with an exception for graduate teaching or research."
     ],
     [
      "Compensatory damages for a physical injury include $15,000 for lost income. The lost-income part is:",
      [
       "Excluded",
       "Taxable",
       "Taxable above $10,000",
       "Deductible"
      ],
      "Compensatory damages tied to a physical injury, lost income included, are excluded."
     ],
     [
      "Paul's mother wasn't physically hurt but received $25,000 for emotional distress. It's:",
      [
       "Taxable",
       "Excluded",
       "Excluded as a gift",
       "Deductible"
      ],
      "No physical personal injury or sickness means no exclusion."
     ]
    ]
   },
   {
    "name": "Fringe Benefits",
    "clues": [
     [
      "Can a $50 employer gift card be a de minimis fringe?",
      [
       "No, cash and gift cards never qualify",
       "Yes, if it's under $100",
       "Yes, at the holidays",
       "Only once a year"
      ],
      "The IRS says cash and gift cards are never de minimis."
     ],
     [
      "An airline employee flies free in an otherwise empty seat. This is a:",
      [
       "No-additional-cost service",
       "Qualified employee discount",
       "Working condition fringe",
       "De minimis fringe"
      ],
      "The employer incurs no substantial added cost."
     ],
     [
      "Employer meals are excluded if they're furnished on the business premises and for whose convenience?",
      [
       "The employer's",
       "The employee's",
       "The customer's",
       "Anyone's"
      ],
      "Meals must be for the convenience of the employer."
     ],
     [
      "Occasional overtime supper money and the company picnic are examples of:",
      [
       "De minimis fringes",
       "No-additional-cost services",
       "Qualified transportation fringes",
       "Taxable compensation"
      ],
      "They're too small to be worth accounting for."
     ],
     [
      "Highly compensated employees can exclude no-additional-cost services only if the benefit is:",
      [
       "Offered on a nondiscriminatory basis",
       "Worth under $500",
       "Used on the premises",
       "Deducted by the employer"
      ],
      "The benefit must be offered on a nondiscriminatory basis."
     ]
    ]
   },
   {
    "name": "Classifying Deductions",
    "clues": [
     [
      "These deductions count even if the taxpayer takes the standard deduction:",
      [
       "Deductions for AGI",
       "Itemized deductions",
       "Personal expenses",
       "Miscellaneous deductions"
      ],
      "Deductions for AGI are taken whether or not you itemize."
     ],
     [
      "Itemized deductions give a tax benefit only if they exceed:",
      [
       "The standard deduction",
       "AGI",
       "$1,000",
       "Taxable income"
      ],
      "Otherwise the taxpayer takes the standard deduction."
     ],
     [
      "§ 162 expenses must be ordinary, necessary, and:",
      [
       "Reasonable",
       "Recurring",
       "Paid in cash",
       "Under $5,000"
      ],
      "Any unreasonable excess is disallowed."
     ],
     [
      "Under the 12-month rule, a prepayment's benefit can't extend beyond the earlier of 12 months or:",
      [
       "The end of the tax year after the year of payment",
       "December 31 of the payment year",
       "24 months",
       "The filing deadline"
      ],
      "That's the second limit of the 12-month rule."
     ],
     [
      "Medical expenses are deductible only to the extent they exceed what % of AGI?",
      [
       "7.5%",
       "2%",
       "10%",
       "15%"
      ],
      "The floor is 7.5% of AGI."
     ]
    ]
   },
   {
    "name": "Disallowed!",
    "clues": [
     [
      "Dr. Payne is fined $3,000 by the city over medical waste disposal. The fine is:",
      [
       "Not deductible",
       "Deductible",
       "Half deductible",
       "A deduction for AGI"
      ],
      "Fines paid to a government violate public policy."
     ],
     [
      "Dr. Payne gives to two state senators' campaigns to support a dental bill. The contributions are:",
      [
       "Not deductible",
       "Deductible",
       "Deductible up to $1,000",
       "An itemized deduction"
      ],
      "Political contributions are never deductible."
     ],
     [
      "Dr. Payne spends $6,000 investigating another dental practice. The cost is:",
      [
       "Deductible whether or not he buys",
       "Not deductible",
       "Deductible only if he buys",
       "Added to his home's basis"
      ],
      "He's already in the same business, so investigation costs are deductible either way."
     ],
     [
      "Dr. Payne pays $10,000 in Dental Society dues, and 70% of the Society's work is lobbying. How much can he deduct?",
      [
       "$3,000",
       "$7,000",
       "$10,000",
       "$0"
      ],
      "Only the 30% not tied to lobbying is deductible."
     ],
     [
      "You sell stock to your brother at a loss. The loss is:",
      [
       "Disallowed",
       "Fully deductible",
       "Deductible up to $3,000",
       "A deduction for AGI"
      ],
      "Losses on sales between related parties are disallowed."
     ]
    ]
   }
  ],
  "final": [
   "Paul's $380,000 settlement for his physical injury includes $160,000 of punitive damages. How much goes in his gross income?",
   [
    "$160,000",
    "$0",
    "$220,000",
    "$380,000"
   ],
   "Only the punitive damages. All $220,000 of compensatory damages are excluded."
  ]
 }
};
