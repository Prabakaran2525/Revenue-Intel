/**
 * Pre-generated analysis and routing for all 44 records.
 * 
 * DISCLOSURE: This analysis was prepared using AI assistance before runtime.
 * The application does NOT call any AI service at runtime. When source text
 * changes (e.g., M07 update), the analysis is marked stale/pending review
 * and the user can update it manually.
 * 
 * Routing categories:
 * - sales_prospecting: Cold outreach to new prospects
 * - sales_followup: Active deal progression / follow-up
 * - partnership: Partner/referral relationship development
 * - customer_success: Existing customer support, issues, onboarding
 * - vendor_evaluation: SpendNest evaluating/procuring from a vendor
 * - product_discovery: Prospect evaluating SpendNest product
 * - internal_training: Internal knowledge transfer / team training
 * - background_activity: Short calls with no substantive contact (voicemail, unresponsive)
 * - needs_review: Insufficient evidence to route confidently
 */

const PRE_GENERATED_ANALYSIS = {
  // ===== CALLS WITH TRANSCRIPTS =====
  
  "call||2ec4404c-beee-5377-a63c-aab701da08ed": {
    // C01 - Arun -> Pranav / Harborlight Advisory
    route: "sales_prospecting",
    routeReason: "Cold outbound call to Harborlight Advisory. Prospect explicitly states he is not interested and did not ask for the call.",
    summary: "Arun cold-called Pranav at Harborlight Advisory to discuss partnership for outsourced finance leadership firms. Pranav was unreceptive, questioned the call source, and declined interest, stating their processes are already advanced.",
    keyFindings: [
      "Prospect explicitly rejected: \"I didn't ask for this call, and I'm not interested.\"",
      "Prospect claims advanced automation: \"Our processes are already very automated. We have a fairly advanced setup.\"",
      "Call source was professional networking outreach programme."
    ],
    evidence: [
      { type: "quote", text: "I didn't ask for this call, and I'm not interested. This number is for my work, not for people to sell things to me.", ref: "C01" },
      { type: "quote", text: "Our processes are already very automated. We have a fairly advanced setup, so I don't think this is something we need.", ref: "C01" }
    ],
    nextActions: [
      "Do not call back. Prospect explicitly declined.",
      "Remove from active call list to avoid repeat contact."
    ],
    coachingNotes: "Arun handled the rejection professionally and was transparent about the cold call nature. Good discipline in disclosing the call source when asked. The prospect's firm (outsourced finance leadership) could be a valid target but this individual does not want contact."
  },

  "call||4b870624-8aad-5315-a60e-0db95981cf99": {
    // C02 - Arun -> Kavya / Fernhaven Group (asking for Leela)
    route: "sales_followup",
    routeReason: "Arun called to reach a named contact (Leela) at Fernhaven Group, suggesting a prior relationship or scheduled follow-up. Redirected to voicemail.",
    summary: "Arun called Fernhaven Group asking for Leela. Kavya (receptionist/gatekeeper) confirmed Leela was not in the office. Arun opted to leave a voicemail.",
    keyFindings: [
      "Target contact Leela was unavailable.",
      "Gatekeeper interaction - no business discussion occurred.",
      "Call was directed to voicemail."
    ],
    evidence: [
      { type: "quote", text: "Could I speak with Leela, please?", ref: "C02" },
      { type: "quote", text: "It looks as though she isn't in the office today. Would you like to leave a message with me, or would you prefer her voicemail?", ref: "C02" }
    ],
    nextActions: [
      "Retry calling Leela at Fernhaven Group.",
      "Check if voicemail was received and follow up."
    ],
    coachingNotes: "Brief gatekeeper interaction. Arun was polite and efficient. No substantive business discussion possible — should retry."
  },

  "call||20d509ba-d589-5334-9aef-ea4ce6105b1a": {
    // C03 - Kiran -> Milan / Developer API access
    route: "sales_followup",
    routeReason: "Follow-up on a prior conversation about developer API access. Milan had previously asked for time. Price was discussed as a concern. Next step is email + Monday call.",
    summary: "Kiran followed up with Milan about developer API access that was discussed previously. Milan acknowledged interest but said it wasn't essential enough to invest heavily. Call had severe audio quality issues (roaming). Agreed to continue via email ('Developer access and event notifications — follow-up') and a call on Monday or Tuesday.",
    keyFindings: [
      "Prior conversation existed about developer functionality / API access.",
      "Price is a barrier: \"it isn't essential enough for us to spend much on it.\"",
      "Audio quality was poor (prospect on roaming), limiting the conversation.",
      "Clear next steps agreed: email follow-up, then Monday/Tuesday call."
    ],
    evidence: [
      { type: "quote", text: "We discussed developer access a while ago, and you asked for about five weeks before following up.", ref: "C03" },
      { type: "quote", text: "it isn't essential enough for us to spend much on it. I would need to check with the team.", ref: "C03" },
      { type: "quote", text: "Could we do this by email? Or call on Monday a bit earlier, when I'm back indoors?", ref: "C03" }
    ],
    nextActions: [
      "Send email with subject 'Developer access and event notifications — follow-up'.",
      "Schedule call for Monday or Tuesday (earlier time when Milan is indoors).",
      "Prepare pricing options that address budget concerns."
    ],
    coachingNotes: "Good persistence on a warm lead. Audio issues were handled well — switching to email is practical. The budget objection needs a solution: consider offering a tier or scaled pricing."
  },

  "call||bcdcbf56-d338-5c78-9a97-42c2fc1c9931": {
    // C04 - Arun -> Ritesh / Lanternpath Media (voicemail)
    route: "sales_followup",
    routeReason: "Follow-up voicemail on an active prospect (Lanternpath Media) where prior communication went to the wrong email address. Now corrected, awaiting response.",
    summary: "Arun left a voicemail for Ritesh at Lanternpath Media. Following up on their consideration of the expense platform. Initial information had been sent to the wrong email address; a corrected address was subsequently used.",
    keyFindings: [
      "Active deal: expense platform consideration for Lanternpath Media.",
      "Prior communication issue: information initially sent to wrong email.",
      "Corrected email was used but no response confirmed yet.",
      "This was a voicemail — no live conversation."
    ],
    evidence: [
      { type: "quote", text: "I'm following up on your consideration of our expense platform for Lanternpath Media.", ref: "C04" },
      { type: "quote", text: "My understanding is that our information first went to the wrong email address. We subsequently used the corrected address you gave us", ref: "C04" }
    ],
    nextActions: [
      "Wait for callback from Ritesh.",
      "If no response within 2-3 days, try calling again or use alternate contact method.",
      "Confirm the corrected email address actually received the materials."
    ],
    coachingNotes: "Arun was clear and professional in the voicemail. The wrong-email issue is a process concern — should verify delivery confirmation. Voicemail is well-structured with clear ask and callback number."
  },

  "call||75a6b94f-7717-5cfb-9e41-0acc94415e17": {
    // C05 - Meera -> multi-store retailer
    route: "sales_prospecting",
    routeReason: "Cold outbound call. Prospect has existing solutions for all discussed use cases but agreed to receive a presentation for future consideration.",
    summary: "Meera cold-called a prospect with multiple stores. The prospect already has vendor management, payment execution, and store-level instant payments in place through providers including StoreHarbor. The prospect asked to receive a presentation for potential future consideration, with email confirmed as contact05@example.com.",
    keyFindings: [
      "Prospect has comprehensive existing setup including StoreHarbor.",
      "Every feature mentioned was already covered: \"We already have that\" (repeated).",
      "Weak interest: asked for presentation only as future reference if they change providers.",
      "Email confirmed: contact05@example.com."
    ],
    evidence: [
      { type: "quote", text: "We already have that.", ref: "C05" },
      { type: "quote", text: "There are several. One is StoreHarbor, and we use others too.", ref: "C05" },
      { type: "quote", text: "If we ever decide to change the providers we already have, we could consider it then.", ref: "C05" }
    ],
    nextActions: [
      "Send presentation to contact05@example.com.",
      "Mark as low priority — prospect is satisfied with current providers.",
      "Note competitive intelligence: StoreHarbor is a known competitor in this segment."
    ],
    coachingNotes: "Meera handled repeated objections well. The prospect was polite but clearly not in buying mode. Good competitive intelligence gathered. Sending the presentation is fine but this should not be a high-priority follow-up."
  },

  "call||12216d5c-e254-52c6-b344-47de4c6e1ae5": {
    // C06 - Meera -> Nikhil / 120+ store retailer
    route: "sales_prospecting",
    routeReason: "Cold outbound call. Prospect (120+ stores) has extensive automation already in place. Firmly declined, offering to reach out if need arises.",
    summary: "Meera cold-called Mr Nikhil at a retailer with 120+ stores. The prospect has a mixed-model approach with significant automation connected through their business management system, with head office managing full visibility. Declined interest and asked not to be called again.",
    keyFindings: [
      "Large prospect: 120+ stores.",
      "Fully automated: \"The essential processes are automated and connected through our business management system. Head office manages it, and we have full visibility.\"",
      "Uses a mixed model for local expenses.",
      "Has a separate monitoring department.",
      "Clear rejection: \"If a particular need comes up later, we will reach out.\""
    ],
    evidence: [
      { type: "quote", text: "We have quite a lot of automation, with a mixed model where needed. The essential processes are automated and connected through our business management system.", ref: "C06" },
      { type: "quote", text: "there is also a separate department here monitoring this every day", ref: "C06" }
    ],
    nextActions: [
      "Do not follow up further. Prospect asked not to be contacted again.",
      "Note for team: suppress this number/contact from future outbound lists.",
      "Document competitive insight: large retailer with integrated BMS."
    ],
    coachingNotes: "Meera was transparent about the cold call nature and gathered useful intel about the prospect's setup. Good question about cash advances vs. cards — this is the kind of qualifying question that helps. The prospect was firm but polite."
  },

  "call||428817fa-7e9e-5418-a7d4-bb396d28dfbf": {
    // C07 - Dev -> Aditya / Willowbank Advisory
    route: "partnership",
    routeReason: "Dev is exploring a partnership where Willowbank Advisory would refer clients (post-incorporation) to SpendNest for virtual business accounts. This is a channel/referral partnership discussion.",
    summary: "Dev called Aditya at Willowbank Advisory to explore a partnership. Willowbank helps clients incorporate companies and typically refers them to providers for business accounts. SpendNest offers virtual accounts for registered businesses. Aditya was open to receiving a proposal via messaging app. Next steps: send details, follow-up call Monday.",
    keyFindings: [
      "Willowbank Advisory helps with overseas incorporation.",
      "They already refer clients to account providers — existing referral workflow.",
      "Aditya was receptive: \"Yes, that's fine\" to Monday follow-up.",
      "Communication preference: messaging app, not email.",
      "Partnership model similar to M01 (Harborpath Advisory)."
    ],
    evidence: [
      { type: "quote", text: "We'd like to partner with advisory firms such as yours so your clients can access a virtual business account after incorporation.", ref: "C07" },
      { type: "quote", text: "Do you currently refer clients to providers for that part of the process? Yes, that is something we normally do.", ref: "C07" },
      { type: "quote", text: "could you message me on our chat app and send whatever proposal you have?", ref: "C07" }
    ],
    nextActions: [
      "Send partnership proposal via messaging app (same phone number).",
      "Schedule follow-up call for Monday.",
      "Prepare similar materials to M01 (Harborpath) partner discussion."
    ],
    coachingNotes: "Dev identified a strong fit — Willowbank already does the referral workflow. Good discovery question about current referral practices. The messaging app preference should be noted and respected."
  },

  "call||129497b2-8e1d-5e01-919c-e8a852b5ff68": {
    // C08 - Meera -> Raghav
    route: "sales_prospecting",
    routeReason: "Cold outbound call. Raghav was receptive, gave an email for proposal, and mentioned a colleague who handles frontline processes and may have been looking at a solution.",
    summary: "Meera cold-called Mr Raghav to discuss consolidating expense and payables processes. Raghav was receptive, mentioned a colleague in people operations who handles frontline processes and locations, and who may have been looking at a similar solution. Provided email: contact08@example.com.",
    keyFindings: [
      "Warm reception — prospect engaged and provided referral.",
      "Internal champion potential: colleague in people ops may already be looking for a solution.",
      "Email provided: contact08@example.com.",
      "SpendNest was positioned as complementing existing enterprise systems."
    ],
    evidence: [
      { type: "quote", text: "The colleague handling our people operations also deals with frontline processes and the locations. I think we may have been looking at a solution, but I don't know the details.", ref: "C08" },
      { type: "quote", text: "If you send him a proposal and say you spoke with me, he can take a look.", ref: "C08" }
    ],
    nextActions: [
      "Send proposal to contact08@example.com mentioning Raghav's referral.",
      "Focus proposal on payment execution, cards, and location-level expense management.",
      "Follow up within one week."
    ],
    coachingNotes: "Good call by Meera. Getting a referral to the right person is valuable. The mention of 'may have been looking at a solution' suggests existing pain. Follow-up should be prompt."
  },

  "call||4a1de681-f884-55e8-b1ad-de22d17cd959": {
    // C09 - Meera -> Vedant / 130 stores
    route: "sales_prospecting",
    routeReason: "Cold outbound call. Prospect has 130 stores with internal software. Provided a referral to business head (Mr Rishabh) but explicitly asked that his name not be used.",
    summary: "Meera cold-called Mr Vedant at a company with ~130 retail locations. They have developed internal expense software and are not currently looking for external solutions. Vedant referred Meera to the business head, Mr Rishabh, via professional networking site, but explicitly requested his name not be used.",
    keyFindings: [
      "130 stores with internally developed software.",
      "Not actively looking: \"at present we aren't looking for anything outside the organisation.\"",
      "Referral given to Mr Rishabh (business head) via professional networking site.",
      "Privacy condition: \"please don't use my name.\"",
      "Unclear whether internal system also executes payments."
    ],
    evidence: [
      { type: "quote", text: "We have developed our own software internally, so at present we aren't looking for anything outside the organisation.", ref: "C09" },
      { type: "quote", text: "you can find our business head, Mr Rishabh, on a professional networking site", ref: "C09" },
      { type: "quote", text: "No, please don't use my name.", ref: "C09" }
    ],
    nextActions: [
      "Find Mr Rishabh on professional networking site.",
      "Contact Rishabh WITHOUT mentioning Vedant's name.",
      "Frame outreach around gaps in internal software (specifically payment execution)."
    ],
    coachingNotes: "Meera asked good qualifying questions and respected the privacy request. The question about whether internal software also makes payments was strategic — identifies a potential gap. However, respecting the name condition is essential."
  },

  "call||b747f592-810e-583c-9b81-8db5ab035806": {
    // C10 - Meera -> Aniket (no longer at Meadowbrick)
    route: "sales_prospecting",
    routeReason: "Cold call that revealed stale data — Aniket no longer works at Meadowbrick. Now in manufacturing. Agreed to receive info via messaging app but firmly declined follow-up call.",
    summary: "Meera called regarding Meadowbrick, but Aniket no longer works there. He has moved to a manufacturing company. He agreed to receive a brief via messaging app but explicitly declined a follow-up call. Manufacturing could be a new target vertical.",
    keyFindings: [
      "Contact data is stale — Aniket left Meadowbrick.",
      "Now in manufacturing sector (different from original retail/distribution target).",
      "Will only engage via messaging app, not phone: \"I will contact you if there is anything to discuss.\"",
      "Meadowbrick remains without a contact."
    ],
    evidence: [
      { type: "quote", text: "I don't work there anymore.", ref: "C10" },
      { type: "quote", text: "No. I said I will contact you if there is anything to discuss.", ref: "C10" }
    ],
    nextActions: [
      "Send brief via messaging app.",
      "Do not call back — prospect explicitly declined.",
      "Update CRM: mark Aniket's Meadowbrick association as stale.",
      "Find new contact at Meadowbrick if still a target account."
    ],
    coachingNotes: "Data quality issue exposed. Meera adapted well to learning the prospect had changed companies. Correctly identified manufacturing as also relevant. However, the prospect was firm about no callback — should respect."
  },

  // ===== MEETINGS WITH TRANSCRIPTS =====

  "meeting||cb5cecac-e68d-52b7-b10b-b0c748efc467": {
    // M01 - Harborpath Advisory partnership
    route: "partnership",
    routeReason: "Partner onboarding discussion. Harborpath Advisory wants to refer clients to SpendNest for virtual accounts. Commission structure, referral link, and onboarding requirements discussed in detail.",
    summary: "Detailed partnership discussion with Harborpath Advisory. Partner A wants to offer SpendNest's virtual business accounts to their US-entity clients. Commission structure discussed: USD 260 per activation, interchange revenue share, and volume bonuses. Partner requested a scalable referral link rather than manual email introductions. Key limitations communicated: no card-payment acceptance (bank transfers only), funding requirement.",
    keyFindings: [
      "Partner already recommends similar providers but receives no commission — commercial incentive is clear.",
      "USD 260 activation commission + spend-based bonuses (USD 195–390 tiers).",
      "Customer pricing: USD 38/mo card plan below USD 2,600 monthly spend (waived above).",
      "Partner wants scalable referral link, not manual email introductions.",
      "Compliance requirements: US entity, incorporation docs, proof of US operations.",
      "Partner interested in podcast and cross-promotion opportunities.",
      "Limitation communicated: no direct card-payment acceptance."
    ],
    evidence: [
      { type: "turn", turnNum: 6, text: "Yes, I use some myself and recommend them. Usually I receive nothing for the recommendation.", ref: "M01" },
      { type: "turn", turnNum: 9, text: "The activation payment is USD 260 when a referred company gets its account approved...", ref: "M01" },
      { type: "turn", turnNum: 20, text: "It cannot depend on me manually writing every email. This needs to scale when people discover the offer through us.", ref: "M01" },
      { type: "turn", turnNum: 23, text: "receiving funds here means bank transfers, not directly taking card payments from customers", ref: "M01" }
    ],
    nextActions: [
      "Send partner memorandum for signing.",
      "Provide unique referral link.",
      "Send partner commission documentation and customer pricing in writing.",
      "Connect partner with marketing for podcast/cross-promotion."
    ],
    coachingNotes: "Well-structured partnership meeting. Team member A covered commission, pricing, compliance requirements, and limitations transparently. The scalability concern (Turn 20) was handled by offering a referral link. Next steps are clear."
  },

  "meeting||1a21c409-c050-5787-90af-2667e057e1b6": {
    // M02 - LedgerBridge vendor evaluation
    route: "vendor_evaluation",
    routeReason: "SpendNest is evaluating LedgerBridge as a vendor for electronic invoicing across multiple markets. This is procurement, not a sales conversation.",
    summary: "SpendNest team evaluated LedgerBridge as a potential vendor for compliant electronic invoicing across Singapore, Australia, and India. LedgerBridge offers both issuing and receiving capabilities. Discussion covered technical integration (API-based), commercial models (country licence vs. per-customer), setup charges (EUR 2,600–6,500+), and timeline (Q4 target, but flexible). SpendNest wants written pricing before management review.",
    keyFindings: [
      "Strategic product extension: SpendNest building accounts receivable module.",
      "Target markets: Singapore, Australia, India (Q4 target, but Q1 possible).",
      "Two pricing models: country licences with usage vs. per-customer with included usage.",
      "Setup charges: EUR 2,600 (basic) to EUR 6,500+ (supported).",
      "Vendor prefers a walkthrough call over sending written pricing, but SpendNest needs written numbers for internal process.",
      "Sandbox available for testing.",
      "SpendNest has prospects discussing requirements but no confirmed pilot customers yet."
    ],
    evidence: [
      { type: "turn", turnNum: 1, text: "We want to understand whether LedgerBridge can give us compliant invoicing coverage across our operating markets.", ref: "M02" },
      { type: "turn", turnNum: 13, text: "We are aiming for the fourth quarter. We would start with Singapore and Australia, then India.", ref: "M02" },
      { type: "turn", turnNum: 31, text: "The basic setup begins at EUR 2,600; a more supported implementation starts at EUR 6,500", ref: "M02" },
      { type: "turn", turnNum: 34, text: "Our evaluation goes through product fit, the business reason, commercials, then references and support checks.", ref: "M02" }
    ],
    nextActions: [
      "Complete volume template (countries, customer sizes, invoices issued/received).",
      "Test LedgerBridge sandbox.",
      "Schedule short explanation call after template completion.",
      "Prepare management briefing with written pricing."
    ],
    coachingNotes: "Team member A drove a well-structured evaluation. Good pushback on receiving written pricing (Turn 34). Team member B asked practical technical questions. The distinction between certain AP volumes and uncertain AR volumes (Turn 18) shows good analytical thinking."
  },

  "meeting||398672e7-62dd-5afd-846d-0237d49792fb": {
    // M03 - Asterloom Systems product discovery
    route: "product_discovery",
    routeReason: "Asterloom Systems is evaluating SpendNest cards for employee expenses. Detailed product demo occurred. Price discussion included a discrepancy issue. CFO approval still needed.",
    summary: "Demo and evaluation call with Asterloom Systems (~65 employees). Customer A (likely decision influencer) and Customer B (finance) explored prepaid cards for domestic employee expenses (INR 10-13 lakh/month). Currently using personal-spend-and-reimburse model. Key issues: no credit facility (prepaid only), workflow approval process, accounting integration gaps (auto-sync after approval not yet available). Price discussed: INR 26,000/year recurring + INR 13,000 one-time setup.",
    keyFindings: [
      "Current pain: employees reluctant to personally fund large travel bookings.",
      "Prepaid vs. credit expectation mismatch: Customer A expected credit cards.",
      "Price discrepancy raised: previously quoted INR 26,000, now INR 39,000 (resolved: 26K recurring + 13K one-time setup).",
      "Would start with 4-5 employees as pilot.",
      "CFO approval needed — not yet briefed.",
      "Overseas provider already in place (satisfied, not looking to change).",
      "Vendor payment volume mentioned: INR 26-39 lakh/month, mostly rent.",
      "Reimbursement module is separate/additional charge."
    ],
    evidence: [
      { type: "turn", turnNum: 6, text: "Wait, these are prepaid? I had thought about a corporate credit card. So we put money in before anyone spends, and there is no credit facility on these domestic cards?", ref: "M03" },
      { type: "turn", turnNum: 23, text: "But you previously told me INR 26,000. Why has that become INR 39,000?", ref: "M03" },
      { type: "turn", turnNum: 26, text: "we need help now, but would start with perhaps four or five employees", ref: "M03" },
      { type: "turn", turnNum: 28, text: "Our CFO approves the larger payments. We need to explain the proposal to them", ref: "M03" }
    ],
    nextActions: [
      "Send cards proposal with clear pricing breakdown (recurring vs. one-time).",
      "Include information about other modules (reimbursement, vendor payments).",
      "Wait for customer to brief CFO internally.",
      "Do not schedule next call — customer will decide: 'Let us make that decision internally before scheduling more.' (Turn 36)"
    ],
    coachingNotes: "IMPORTANT: Price discrepancy (Turn 23) caused friction. In future, ensure quoted prices are consistent. The customer noticed and it undermined trust. Auto-sync after approval is a product gap acknowledged on-call. The prepaid/credit distinction should be set early to avoid surprises."
  },

  "meeting||b0f79b3d-37ba-52f9-b2bc-58b159dd6d91": {
    // M04 - Cedarwave Distribution customer success
    route: "customer_success",
    routeReason: "Existing customer (Cedarwave Distribution) discussing mandatory card programme migration, integration issues, and potential credit card solution. This is a retention/success conversation.",
    summary: "Customer success discussion with Cedarwave Distribution about a mandatory card programme migration. Current programme being shut down; replacement is still prepaid (not credit). Customer strongly needs credit facility (INR 1.3 crore credit line exists with bank). Discussion explored: (1) migrating to new prepaid programme, (2) potentially connecting bank-issued credit cards to SpendNest platform, (3) department structure issues. Multiple open items need follow-up.",
    keyFindings: [
      "MANDATORY MIGRATION: Current card programme closing in weeks. Users must re-do KYC.",
      "Customer's primary need is credit, not prepaid: 'moving from prepaid to credit is the main issue for us.' (Turn 11)",
      "Existing bank credit line: INR 1.3 crore. Cards issued to few people.",
      "Bank card feed is post-settlement only — no real-time balance visibility.",
      "Customer B questioned value: 'What do we gain by adding SpendNest?' (Turn 26)",
      "Previous bank card enquiry was put on hold from customer's side.",
      "Department structure issue also unresolved."
    ],
    evidence: [
      { type: "turn", turnNum: 4, text: "The plan is to close the old programme in the coming weeks, so we need to organise the transition.", ref: "M04" },
      { type: "turn", turnNum: 11, text: "moving from prepaid to credit is the main issue for us. At some stage we will have to consider another option for that.", ref: "M04" },
      { type: "turn", turnNum: 22, text: "We already have a corporate credit line of about INR 1.3 crore.", ref: "M04" },
      { type: "turn", turnNum: 26, text: "What do we gain by adding SpendNest? We can already see transactions in the bank portal.", ref: "M04" }
    ],
    nextActions: [
      "Check if existing bank-issued credit cards can join the transaction-feed programme.",
      "Confirm accounting integration feasibility for bank-card transactions.",
      "Arrange session for department structure/user moves.",
      "Prepare migration plan with parallel old/new operation."
    ],
    coachingNotes: "RISK: Customer B's question 'What do we gain?' signals churn risk. The value proposition for bank-card integration (receipt collection, review, accounting) must be clearly articulated. The mandatory migration creates urgency but also frustration. The credit need is existential — if SpendNest cannot offer credit path, customer may look at alternatives."
  },

  "meeting||657b9e9d-9472-5b01-a127-a648ad7e8cf7": {
    // M06 - Mapletrail Services product discovery
    route: "product_discovery",
    routeReason: "Exploratory discussion with Mapletrail Services about receivables automation, expense management, and collections. The customer is evaluating capabilities, not resolving support issues.",
    summary: "Discovery discussion with Mapletrail Services (software development/testing company). Customer A handles finance for one branch (~65 finance staff company-wide). Discussion covered: (1) receivables/collections automation — high-value invoices (260-390/month across 65-78 customers), (2) cash application challenges, (3) expense management with cards, (4) payables. Customer showed interest in automation replacing manual contract review and follow-up.",
    keyFindings: [
      "High invoice volume: 260-390+ per month, many in foreign currency.",
      "Manual collections process: contract review, delivery verification, customer follow-up.",
      "Specific problem: expense-recovery invoice outstanding for months while normal invoices paid.",
      "Centralized finance team (~65 people) with local branch operations.",
      "Privacy/security concerns raised about payment information.",
      "Interest expressed but no commitment — 'Please send the information and we can stay in touch.' (Turn 33)"
    ],
    evidence: [
      { type: "turn", turnNum: 12, text: "Around 65–78 customers. There may be several projects for each. Initially I would estimate 260–390 invoices a month, with a large total value.", ref: "M06" },
      { type: "turn", turnNum: 10, text: "One expense-recovery invoice has been outstanding for months even though the same client pays the normal service invoices.", ref: "M06" },
      { type: "turn", turnNum: 31, text: "Confidentiality is important. Payment information is sensitive. How is that protected", ref: "M06" }
    ],
    nextActions: [
      "Send information about receivables automation and expense management.",
      "Include security/compliance documentation (addressing confidentiality concern).",
      "Focus on collections automation as primary value proposition.",
      "Follow up after material review."
    ],
    coachingNotes: "Team member A did extensive discovery. The receivables angle appears promising given the volume (260-390 invoices/month). The security question (Turn 31) suggests the customer is seriously considering but needs reassurance. Good pivoting between receivables and expense topics."
  },

  "meeting||4f304fff-fd40-5cfc-a366-0a134c445c2a": {
    // M07 - Willowfield Trust customer support (arrives in update)
    route: "customer_success",
    routeReason: "Existing customer (Willowfield Trust) reporting multiple product bugs/issues in a screen-sharing session. This is a support/CS interaction.",
    summary: "Customer support session with Willowfield Trust. Customer A demonstrated multiple bugs: (1) description field not saving changes, (2) document upload failing on 'Recreate payment' screen (workaround identified via invoice inbox route), (3) reimbursement transactions stuck in 'Processing' state, (4) 'Mark as paid' carrying forward previous payment amount. Team member A captured evidence and committed to escalating to the development team.",
    keyFindings: [
      "BUGS REPORTED — 4 distinct issues affecting customer workflow:",
      "Bug 1: Description edits not persisting after save.",
      "Bug 2: Document upload fails on 'Recreate payment' screen (workaround: use invoice inbox Review).",
      "Bug 3: Reimbursement payments stuck in Processing (should show as completed).",
      "Bug 4: 'Mark as paid' carrying forward previous item's amount (refresh issue).",
      "Team member A documented issues with screenshots and promised same-day investigation."
    ],
    evidence: [
      { type: "turn", turnNum: 2, text: "The first one is editing the description. I am changing this event-payment description to a short reference and clicking Save changes.", ref: "M07" },
      { type: "turn", turnNum: 8, text: "Next is Recreate payment. Can we look at that here? When I go through this route, I cannot upload a document.", ref: "M07" },
      { type: "turn", turnNum: 16, text: "The next issue is in reimbursements. I cannot select the first group of transactions on this screen.", ref: "M07" },
      { type: "turn", turnNum: 22, text: "The amount from the previous item appears in the next one. Each time I have to cancel, leave it and open Mark as paid again before it shows the right information.", ref: "M07" }
    ],
    nextActions: [
      "Escalate all 4 bugs to development team with screenshots.",
      "Provide update to customer on bug investigation (promised same-day or Monday).",
      "Document the upload workaround for other affected users.",
      "Check if Processing-stuck issue affects other users."
    ],
    coachingNotes: "Team member A handled the support session well — acknowledged issues, captured evidence, identified workarounds, and set clear expectations. Good practice: 'The workaround does not mean the direct upload issue has been resolved' (Turn 15) — important to not let workarounds become permanent."
  },

  "meeting||4b5b9192-f3fc-505a-8e77-4d2ffaa54594": {
    // M09 - Account setup / Brookmint Holdings + Northkite Equipment
    route: "customer_success",
    routeReason: "Existing customer needing help with account setup (Brookmint Holdings invitation expired), workflow questions (Northkite Equipment), and access control discussion.",
    summary: "Customer onboarding/support session covering two companies: Brookmint Holdings (invitation link expired twice, still unresolved) and Northkite Equipment (tax treatment corrected, workflow questions). Discussion included access control concerns — customer doesn't want shared mailbox admin access to create unintended permissions for AP officer.",
    keyFindings: [
      "BLOCKER: Brookmint Holdings invitation token expired. Fresh link also expired immediately.",
      "Customer manages two companies: Brookmint Holdings (larger, ~most employees) and Northkite Equipment (smaller, few users).",
      "Access control concern: shared mailbox admin access would give AP officer unintended administrator rights.",
      "Customer self-corrected tax treatment in Northkite Equipment.",
      "Missing receipt and supplier creation permission issues identified.",
      "Customer wants separate personal work identities for the two companies."
    ],
    evidence: [
      { type: "turn", turnNum: 1, text: "The invitation for Brookmint Holdings did not work when I tried it. It may have expired", ref: "M09" },
      { type: "turn", turnNum: 21, text: "It says the token has expired. This is the fresh message we just received.", ref: "M09" },
      { type: "turn", turnNum: 17, text: "I do not want this to depend on trusting someone not to use access that is available. That does not solve the permission problem.", ref: "M09" },
      { type: "turn", turnNum: 24, text: "Brookmint Holdings has most of the employees. Before that becomes busy, I need to answer their questions", ref: "M09" }
    ],
    nextActions: [
      "URGENT: Investigate expired token issue with team (promised update same day or Monday).",
      "Resolve Brookmint Holdings login before employee onboarding begins.",
      "Advise on access control setup (separate admin email or narrower role).",
      "Offer refresher training session."
    ],
    coachingNotes: "The expired-token issue is a significant blocker that risks delaying the larger company's onboarding. Team member A appropriately escalated. The access control discussion (Turns 9-18) shows mature security thinking from the customer — the response should offer a concrete solution, not just trust-based workarounds."
  },

  "meeting||337f297d-9385-5b82-9e54-5019c1ed912c": {
    // M10 - Internal billing training
    route: "internal_training",
    routeReason: "Internal training session on billing workflow — subscription management, invoice generation, payment collection, and failure/freeze procedures. No customer present.",
    summary: "Internal training session on SpendNest's billing workflow. Team member A (trainer) walked through: subscription components, invoice generation/clearing, due date flexibility, payment retry sequence (Days 1-3-7-10), account freeze procedures, and recovery process. Key insight: the displayed due date and allowed collection period differ.",
    keyFindings: [
      "Invoice due period is nominally 7 days but can extend to month-end.",
      "End-of-month invoices may get mid-next-month extension.",
      "Payment retry sequence: Day 1 (generate), Day 3 (retry), Day 7 (warning retry), Day 10 (freeze if failed).",
      "Account freeze requires manual intervention to unfreeze — just topping up doesn't work.",
      "Operations must manually adjust next billing date after clearing frozen invoice.",
      "Zero-value invoices are legitimate (no charge due in cycle).",
      "Team member B lacks back-office super-admin access."
    ],
    evidence: [
      { type: "turn", turnNum: 7, text: "The nominal due period is seven days, but we sometimes give the customer until the end of the month.", ref: "M10" },
      { type: "turn", turnNum: 15, text: "Suppose the invoice is INR 6,240 but the wallet contains INR 6,110. The deduction fails", ref: "M10" },
      { type: "turn", turnNum: 17, text: "Simply topping up a frozen account does not complete the whole recovery flow", ref: "M10" },
      { type: "turn", turnNum: 18, text: "Clearing the payment without checking that date can leave the next cycle wrong.", ref: "M10" }
    ],
    nextActions: [
      "Arrange back-office super-admin access for Team member B.",
      "Document billing workflow and edge cases for ops team reference.",
      "Schedule follow-up training session."
    ],
    coachingNotes: "Well-structured training session. Team member A covered edge cases thoroughly (zero-value invoices, freeze/unfreeze, date mismatch). The manual adjustment requirement after freeze recovery is a known process gap that could cause billing errors if not followed."
  },

  // ===== MEETINGS WITHOUT TRANSCRIPTS =====

  "meeting||e7db14c3-e5dd-5d57-8e0b-a79344e8edab": {
    // M05 - Pinehaven Studio setup
    route: "needs_review",
    routeReason: "Meeting was recorded but no speech detected. Cannot determine the nature or outcome of this meeting from available evidence.",
    summary: "Meeting titled 'SpendNest setup - Pinehaven Studio' was recorded but no speech was detected. The meeting duration was 987 seconds (~16 minutes). Without transcript content, the nature of the discussion cannot be determined.",
    keyFindings: [
      "No usable transcript despite recording.",
      "Meeting title suggests product setup / onboarding for Pinehaven Studio.",
      "Duration indicates a substantive meeting may have occurred."
    ],
    evidence: [],
    nextActions: [
      "Check with organizer (team08@example.com) about what was discussed.",
      "Determine if this was an actual meeting or a recording issue."
    ],
    coachingNotes: "No speech detected — could be a screen-share session without microphone, a technical issue, or a meeting where participants used a different audio channel."
  },

  "meeting||af74de78-8d56-583b-93a9-f6b02c843d4e": {
    // M08 - Amberleaf Health demo
    route: "needs_review",
    routeReason: "Meeting was recorded but no speech detected. Title suggests a product demonstration for Amberleaf Health.",
    summary: "Meeting titled 'SpendNest product demonstration - Amberleaf Health' was recorded but no speech was detected. Duration was 984 seconds (~16 minutes). Without transcript content, the demo outcome cannot be assessed.",
    keyFindings: [
      "No usable transcript despite recording.",
      "Meeting title suggests product demo for a healthcare company.",
      "Duration suggests a substantive session occurred."
    ],
    evidence: [],
    nextActions: [
      "Check with organizer (team08@example.com) about demo outcome.",
      "Determine next steps with Amberleaf Health."
    ],
    coachingNotes: "Same organizer as M05 (team08@example.com). Two meetings on the same day with no speech detected may indicate a systematic recording/audio issue for this organizer."
  },

  "meeting||d94fe28f-4178-5c2a-8f17-e7b43c497e9e": {
    // M11 - Internal design discussion
    route: "needs_review",
    routeReason: "Internal meeting recorded but no speech detected. Short duration (194 seconds).",
    summary: "Internal design discussion lasting only 194 seconds (~3 minutes). No speech was detected despite recording. The short duration and internal nature may indicate a brief check-in or cancelled discussion.",
    keyFindings: [
      "Very short duration: 3 minutes.",
      "Internal meeting — no customer involved.",
      "No usable transcript."
    ],
    evidence: [],
    nextActions: [
      "Low priority. Check with organizer (team13@example.com) if needed."
    ],
    coachingNotes: "Very brief internal meeting with no speech. May have been a quick sync that moved to another channel."
  },

  "meeting||0ce69b48-c2ec-5d42-b019-e233c363e5c6": {
    // M12 - Sample account setup (cancelled recording)
    route: "needs_review",
    routeReason: "Recording was cancelled before the meeting started. No transcript available. Cannot assess meeting outcome.",
    summary: "Meeting titled 'SpendNest setup - Sample account' had its notetaker cancelled before the meeting started. Duration of 1800 seconds (~30 minutes) suggests the meeting may have occurred without recording. Organizer is arun@example.com.",
    keyFindings: [
      "Notetaker cancelled — no recording or transcript.",
      "Meeting may have occurred based on scheduled duration.",
      "Title suggests a demo/test account setup."
    ],
    evidence: [],
    nextActions: [
      "Check with Arun about the meeting outcome.",
      "Determine if this was an internal test or customer-facing setup."
    ],
    coachingNotes: "Cancelled notetaker — could be intentional (test/internal) or accidental. Follow up with organizer."
  },

  "meeting||03ba8f10-fe94-5c00-aae3-3e47f25aeeae": {
    // M13 - Cedarwave Distribution migration (no notetaker scheduled)
    route: "customer_success",
    routeReason: "Related to Cedarwave Distribution (same as M04). Migration discussion with no notetaker scheduled. Given M04 context, this is part of an ongoing customer success effort.",
    summary: "Meeting titled 'SpendNest <> Cedarwave Distribution - Migration discussion' had no notetaker scheduled. Duration of 3600 seconds (~60 minutes). Given the M04 discussion about a mandatory card programme migration for Cedarwave Distribution, this meeting likely covered the same topic. Organizer is team09@example.com (same as M04).",
    keyFindings: [
      "No recording or transcript — notetaker was never scheduled.",
      "Same customer and organizer as M04.",
      "Title explicitly mentions migration — aligns with M04's discussion of mandatory programme change.",
      "1-hour scheduled duration suggests a substantial meeting."
    ],
    evidence: [],
    nextActions: [
      "Check with team09@example.com about meeting outcome.",
      "Cross-reference with M04 migration discussion findings."
    ],
    coachingNotes: "No notetaker for a substantive customer migration discussion is a process gap. Consider whether all customer-facing meetings should have recording by default."
  },

  "meeting||1d16a994-18e1-54f7-80df-d91c7f05197c": {
    // M14 - CRM demonstration (cancelled)
    route: "needs_review",
    routeReason: "Recording was cancelled. Title suggests an internal CRM demonstration. Cannot assess without transcript.",
    summary: "Meeting titled 'CRM demonstration' had its notetaker cancelled. Duration of 3600 seconds (~60 minutes). This appears to be an internal demonstration of CRM tools. Organizer is team14@example.com.",
    keyFindings: [
      "Notetaker cancelled — no recording or transcript.",
      "Title suggests internal tooling/CRM demo.",
      "1-hour scheduled duration."
    ],
    evidence: [],
    nextActions: [
      "Low priority for sales analysis.",
      "May be relevant for internal process improvement."
    ],
    coachingNotes: "Internal CRM demo — less relevant for sales coaching unless specific insights about CRM usage emerged."
  },

  // ===== BACKGROUND CALLS (B01-B20) =====
  // These all share the same basic pattern — no transcript, short duration
};

// Generate background call analyses
const backgroundCallIds = [
  { ref: "B01", id: "4868e5cd-5ab8-581c-a0e4-acc37385f0cf", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 8 },
  { ref: "B02", id: "5747e4cd-e24f-5bed-bf74-9e3f326b2d77", rep: "Leela", dir: "inbound", outcome: "unresponsive", dur: 20 },
  { ref: "B03", id: "50e7e6df-c341-5ed1-88d8-0ab3a36c5ece", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 4 },
  { ref: "B04", id: "fbdb9ee3-8c8e-5a73-af6e-d2aab1d3f49d", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 8 },
  { ref: "B05", id: "98db5a23-93bb-5e1e-930a-3f75b2b8e8b7", rep: "Leela", dir: "outbound", outcome: "voicemail", dur: 5 },
  { ref: "B06", id: "b2cb1a51-6d2e-5da4-9fae-f2aca8d62f3b", rep: "Leela", dir: "inbound", outcome: "unresponsive", dur: 17 },
  { ref: "B07", id: "ae7ef0d0-c1b3-5d8e-9c6c-ea3c3fc92283", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 3 },
  { ref: "B08", id: "68cf8c3a-8f81-5f3e-9c32-9d3d5ef1b917", rep: "Leela", dir: "inbound", outcome: "unresponsive", dur: 21 },
  { ref: "B09", id: "4bec6e72-8bc9-5b47-babe-88149b9fd4d3", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 26 },
  { ref: "B10", id: "94b5e36a-6f4e-5b98-8024-80e834143d1e", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 10 },
  { ref: "B11", id: "cc9e4f5e-c31e-5fd4-b11e-4f7e29a1e4c2", rep: "Leela", dir: "inbound", outcome: "unresponsive", dur: 26, connected: true },
  { ref: "B12", id: "d3b2f0a7-e6c4-5d8a-9f1b-3c7e8a2d5f09", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 10 },
  { ref: "B13", id: "a1c4e7d2-b5f8-5e3a-8d6c-9f0e2b4a7c15", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 4 },
  { ref: "B14", id: "f8d3a2e5-c7b6-5f4d-ae9c-1b0d3e5f7a28", rep: "Leela", dir: "outbound", outcome: "unresponsive", dur: 9, connected: true },
  { ref: "B15", id: "e5a8c1d4-b3f7-5e6d-9a2c-4d8e1f0b3c56", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 22 },
  { ref: "B16", id: "c2d5e8a1-f4b7-5d3e-8c6a-7b0e9f1d2a45", rep: "Leela", dir: "outbound", outcome: "voicemail", dur: 4 },
  { ref: "B17", id: "b9e2d5a8-c1f4-5b7e-9d3a-6c8e0f2a4b67", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 9 },
  { ref: "B18", id: "a6d9e2b5-f8c1-5a4e-8b7d-3f0c6e9a1d78", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 31 },
  { ref: "B19", id: "d3a6e9b2-c5f8-5d1e-9a4b-7c0e3f6a8b19", rep: "Arun", dir: "outbound", outcome: "voicemail", dur: 10 },
  { ref: "B20", id: "c0d3e6a9-b2f5-5c8e-8d1a-4f7b0e3c6a90", rep: "Leela", dir: "outbound", outcome: "voicemail", dur: 3 }
];

backgroundCallIds.forEach(bc => {
  const key = `call||${bc.id}`;
  PRE_GENERATED_ANALYSIS[key] = {
    route: "background_activity",
    routeReason: `Background ${bc.dir} call (${bc.outcome}, ${bc.dur}s). No transcript available.`,
    summary: `${bc.dir === 'outbound' ? 'Outbound' : 'Inbound'} call by ${bc.rep}, lasting ${bc.dur} seconds. Classified as ${bc.outcome} by source system. No transcript supplied.`,
    keyFindings: [
      `${bc.outcome === 'voicemail' ? 'Reached voicemail' : 'Unresponsive call'} — no substantive conversation.`,
      `Duration: ${bc.dur} seconds.`,
      `Source classification: is_connected=${bc.connected || false}, is_conversation=false.`
    ],
    evidence: [],
    nextActions: [],
    coachingNotes: "Background call — no coaching applicable without transcript."
  };
});
