import type { KbCorpus } from './types';

// Fictional company and fictional rules, written for this demonstration only.
export const corpusEn: KbCorpus = {
  company: 'Vela Norte',
  handoffTeam: 'HR',
  documents: [
    {
      id: 'reembolso',
      title: 'Expense reimbursement',
      owner: 'Finance',
      updated: '2026-07',
      summary: 'Deadlines, limits, and receipts for reimbursement requests.',
      sections: [
        {
          id: 'quem-pode',
          heading: 'Who can request it',
          paragraphs: [
            'Employees and interns can request reimbursement for expenses incurred for work and approved by their manager. Contractors follow the terms of their own contract and do not use this process.',
          ],
        },
        {
          id: 'prazos',
          heading: 'Deadlines and submission',
          paragraphs: [
            'A reimbursement request must be filed in the Finance Portal within 30 calendar days of the expense date. Late requests are only reviewed with a justification from your direct manager.',
            'Each request needs the invoice or receipt, as a PDF or a readable photo. Card slips that do not describe what was purchased are not accepted.',
          ],
        },
        {
          id: 'limites',
          heading: 'Limits by category',
          paragraphs: [
            'Work meals are limited to R$ 90 per person per day. When traveling, the meal limit rises to R$ 140 per day and includes breakfast when the hotel does not offer it.',
            'Ride-hailing trips are fully reimbursed for client visits. Mileage in your own car is paid at R$ 1.20 per kilometer, with the route described in the request.',
          ],
        },
        {
          id: 'aprovacao',
          heading: 'Approval and payment',
          paragraphs: [
            'Your direct manager approves the reimbursement within 5 business days. Finance then checks the receipts and pays it with the following month\'s payroll, or in the next fortnight when the amount exceeds R$ 1,000.',
          ],
        },
        {
          id: 'nao-reembolsavel',
          heading: 'What is not reimbursable',
          paragraphs: [
            'Alcoholic drinks, traffic fines, tips above 10%, and personal purchases are not reimbursed. When a receipt mixes personal and work items, ask the cashier for separate receipts.',
          ],
        },
      ],
    },
    {
      id: 'ferias',
      title: 'Vacation and time off',
      owner: 'HR',
      updated: '2026-05',
      summary: 'How to split, request, and record vacation, leave, and days off.',
      sections: [
        {
          id: 'direito',
          heading: 'How many days and how to split them',
          paragraphs: [
            'Every employee is entitled to 30 days of vacation for every 12 months worked.',
            'Vacation can be split into up to three periods, one of them at least 14 calendar days long and the others at least 5 days each.',
          ],
        },
        {
          id: 'como-pedir',
          heading: 'Deadline and how to request it',
          paragraphs: [
            'Vacation is requested in the People Portal at least 45 days in advance. Your manager has 7 days to approve it or suggest another date.',
            'Vacation cannot start in the two days before a public holiday or the weekly rest day. Payment arrives up to 2 days before the start date.',
          ],
        },
        {
          id: 'abono',
          heading: 'Selling days and advances',
          paragraphs: [
            'You can sell up to 10 vacation days, as long as you ask for it in the same vacation request. An advance on the first installment of the 13th-month salary can be requested on the same form.',
          ],
        },
        {
          id: 'ausencias',
          heading: 'Excused absences',
          paragraphs: [
            'Medical appointments and tests are recorded on the time sheet, with the medical certificate sent to HR within 48 hours. Sick leave longer than 15 days follows the leave process, with support from HR.',
            'Weddings, the birth of a child, or a death in the family are reported in the People Portal. Vela Norte grants 5 days off for a wedding and 20 days of paternity leave.',
          ],
        },
        {
          id: 'banco-de-horas',
          heading: 'Days off and time bank',
          paragraphs: [
            'Approved overtime goes into a time bank, which must be used within 6 months. Days off are agreed with your manager and recorded on the time sheet.',
          ],
        },
      ],
    },
    {
      id: 'remoto',
      title: 'Remote and hybrid work',
      owner: 'HR',
      updated: '2026-08',
      summary: 'Work models, office days, and working outside Brazil.',
      sections: [
        {
          id: 'modelos',
          heading: 'Work models',
          paragraphs: [
            'Vela Norte has three work models: on-site, hybrid, with two fixed office days per week, and remote. The model for each role is set at hiring and can be reviewed with your manager once a year.',
          ],
        },
        {
          id: 'escritorio',
          heading: 'Office days',
          paragraphs: [
            'In the hybrid model, Tuesday and Thursday are office days for most teams. Book your desk in the Mesa Livre app by 6 pm the day before.',
          ],
        },
        {
          id: 'exterior',
          heading: 'Working outside Brazil',
          paragraphs: [
            'Working from another country is allowed for up to 30 days per year, adding up all periods, and requires prior approval from HR and your manager. The request must be made 20 days in advance in the People Portal.',
            'Longer periods abroad depend on a legal and tax review and are generally not approved. Access to client systems may be blocked outside Brazil.',
          ],
        },
        {
          id: 'auxilio',
          heading: 'Home office allowance',
          paragraphs: [
            'Remote and hybrid employees receive a home office allowance of R$ 150 per month, paid with payroll, to help with internet and electricity. A chair and a monitor can be requested once, through the equipment process.',
          ],
        },
        {
          id: 'horario',
          heading: 'Hours and availability',
          paragraphs: [
            'Shared collaboration hours are 10 am to 4 pm, Brasília time. Outside that window, each person organizes their own schedule and keeps their chat status up to date.',
          ],
        },
      ],
    },
    {
      id: 'equipamentos',
      title: 'Equipment and laptops',
      owner: 'IT',
      updated: '2026-06',
      summary: 'Starter kit, replacement, loss, theft, and returning equipment.',
      sections: [
        {
          id: 'kit',
          heading: 'Starter kit',
          paragraphs: [
            'Everyone receives a configured laptop, charger, mouse, and headset on their first day. Design and data teams also receive a 27 inch external monitor.',
          ],
        },
        {
          id: 'troca',
          heading: 'Replacement and upgrades',
          paragraphs: [
            'Laptops are replaced every 4 years, or sooner if an IT diagnosis finds a defect that cannot be repaired. To request a new laptop, open an IT ticket with the asset tag of your current one. Memory upgrade requests go through your manager and IT and are handled within 10 business days.',
          ],
        },
        {
          id: 'perda-roubo',
          heading: 'Loss, theft, or damage',
          paragraphs: [
            'If your laptop is lost or stolen, tell IT right away in the #it-urgent channel so the device can be locked remotely. Then file a police report and attach it to the ticket within 3 days.',
            'Accidental damage to a laptop is covered by the company insurance once a year. From the second damage in the same year, your manager reviews the case with IT.',
          ],
        },
        {
          id: 'uso',
          heading: 'Personal use and software',
          paragraphs: [
            'The laptop can be used for light personal tasks, but not to store personal files. Only install software from the IT catalog; requests outside the catalog are reviewed within 5 business days.',
          ],
        },
        {
          id: 'devolucao',
          heading: 'Returning equipment',
          paragraphs: [
            'When someone leaves the company, the equipment must be returned within 5 business days. For remote employees, IT schedules a pickup at home at no cost to them.',
          ],
        },
      ],
    },
    {
      id: 'seguranca',
      title: 'Information security',
      owner: 'IT',
      updated: '2026-09',
      summary: 'Passwords, phishing, data classification, and incidents.',
      sections: [
        {
          id: 'senhas',
          heading: 'Passwords and access',
          paragraphs: [
            'Use the company password manager and turn on two-factor authentication in every system that offers it. Passwords must have at least 14 characters and must never be shared, not even with IT.',
          ],
        },
        {
          id: 'phishing',
          heading: 'Phishing and suspicious messages',
          paragraphs: [
            'Be wary of messages that ask for urgency, passwords, or payments. Use the Report phishing button in your email to forward a suspicious message, and do not click links or open attachments.',
          ],
        },
        {
          id: 'classificacao',
          heading: 'Data classification',
          paragraphs: [
            'Vela Norte data is classified as public, internal, confidential, or restricted. Client data is always confidential and may only be kept in systems approved by IT.',
            'Do not send confidential data through personal chat apps, USB drives, or personal email. To share files with partners, use a secure link from the company drive with an expiration date.',
          ],
        },
        {
          id: 'incidentes',
          heading: 'Security incidents',
          paragraphs: [
            'Any suspected incident, such as unauthorized access, a data leak, or a lost device, must be reported within 1 hour in the #security channel. Do not investigate on your own or delete evidence.',
          ],
        },
        {
          id: 'ia',
          heading: 'AI tools',
          paragraphs: [
            'External AI tools may only receive public information. For internal data, use only the tools approved by IT, which do not store conversation content.',
          ],
        },
      ],
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      owner: 'HR',
      updated: '2026-04',
      summary: 'What happens before the start date and during the first 90 days.',
      sections: [
        {
          id: 'antes',
          heading: 'Before your first day',
          paragraphs: [
            'HR sends the welcome kit and the contract for digital signature up to 5 days before the start date. The laptop is delivered to your home or is ready at reception, depending on your work model.',
          ],
        },
        {
          id: 'primeira-semana',
          heading: 'First week',
          paragraphs: [
            'During the first week, new hires join the orientation on Monday, meet the team, and are paired with a buddy who supports them for the first 90 days. The required security and conduct courses must be completed by Friday.',
          ],
        },
        {
          id: 'acessos',
          heading: 'Access',
          paragraphs: [
            'Basic access, such as email, chat, and the People Portal, is enabled on the first day. Access to client systems depends on a request from your manager and takes up to 2 business days.',
          ],
        },
        {
          id: 'acompanhamento',
          heading: 'Check-ins',
          paragraphs: [
            'There are check-in conversations with your manager at 30, 60, and 90 days. At the end of the 90 days, new hires answer an onboarding survey that helps HR improve the process.',
          ],
        },
      ],
    },
    {
      id: 'viagens',
      title: 'Business travel',
      owner: 'Finance',
      updated: '2026-03',
      summary: 'Notice periods, flights, hotels, advances, and cancellations.',
      sections: [
        {
          id: 'solicitacao',
          heading: 'Requesting a trip',
          paragraphs: [
            'Every business trip is requested in the Travel Portal at least 10 days in advance for domestic flights and 21 days for international flights. Your manager approves the trip before anything is booked.',
          ],
        },
        {
          id: 'passagens',
          heading: 'Flights and hotels',
          paragraphs: [
            'The partner travel agency books economy class, choosing the cheapest fare within two hours of the requested time. Flights longer than 8 hours may be booked in premium economy.',
            'Hotel spending is limited to R$ 380 per night in state capitals and R$ 280 in other cities. The nightly rate should include breakfast whenever possible.',
          ],
        },
        {
          id: 'adiantamento',
          heading: 'Travel advance',
          paragraphs: [
            'Trips with an overnight stay qualify for an optional advance of up to R$ 500, which must be accounted for within 10 days of returning. Meals follow the limits in the reimbursement policy.',
          ],
        },
        {
          id: 'seguro',
          heading: 'Insurance and emergencies',
          paragraphs: [
            'International trips include travel insurance booked by the agency. In an emergency, call the agency hotline, available 24 hours a day, and tell your manager as soon as you can.',
          ],
        },
        {
          id: 'cancelamentos',
          heading: 'Cancellations and changes',
          paragraphs: [
            'Trip cancellations and changes are requested in the Travel Portal. Fees caused by personal reasons may be deducted, at your manager\'s discretion.',
          ],
        },
      ],
    },
    {
      id: 'beneficios',
      title: 'Benefits',
      owner: 'HR',
      updated: '2026-01',
      summary: 'Health, meals, wellbeing, and education support.',
      sections: [
        {
          id: 'saude',
          heading: 'Health plan',
          paragraphs: [
            'Health and dental insurance plans are offered at no cost to everyone who works at Vela Norte. The health plan also covers dependents, who can be added with a 30% share of the monthly fee.',
          ],
        },
        {
          id: 'alimentacao',
          heading: 'Meal allowance',
          paragraphs: [
            'The meal and grocery allowance is R$ 1,100 per month, credited to the flexible benefits card by the fifth business day. The amount can be split freely between restaurants and groceries.',
          ],
        },
        {
          id: 'bem-estar',
          heading: 'Wellbeing',
          paragraphs: [
            'The wellbeing allowance of R$ 120 per month can be used for gyms, meditation apps, or therapy. There are also 3 free counseling sessions per month through the Conversa Aberta program.',
          ],
        },
        {
          id: 'educacao',
          heading: 'Education support',
          paragraphs: [
            'Education support reimburses up to 70% of the cost of courses related to your role, with an annual limit of R$ 6,000. Enrollment must be approved by your manager before the course starts.',
          ],
        },
        {
          id: 'inicio',
          heading: 'When benefits start',
          paragraphs: [
            'Benefits apply from the first day of work, except education support, which becomes available after 3 months at the company.',
          ],
        },
      ],
    },
    {
      id: 'atendimento',
      title: 'Customer support (internal SLA)',
      owner: 'Support',
      updated: '2026-08',
      summary: 'Priorities, response times, escalation, and on-call duty.',
      sections: [
        {
          id: 'prioridades',
          heading: 'Priorities',
          paragraphs: [
            'Client tickets have four priorities: critical, when the system is down; high, when a core feature fails; medium, when there is an error with a workaround; and low, for questions and improvements.',
          ],
        },
        {
          id: 'prazos',
          heading: 'Response times',
          paragraphs: [
            'The first response to the client must go out within 30 minutes for critical tickets, 2 hours for high priority, 8 business hours for medium, and 2 business days for low.',
            'Critical tickets get a client update every hour until they are solved, even when there is no news yet.',
          ],
        },
        {
          id: 'escalonamento',
          heading: 'Escalation',
          paragraphs: [
            'If a critical ticket is not solved within 4 hours, the on-call engineer escalates it to engineering leadership. High priority tickets are escalated after 1 business day without a solution.',
          ],
        },
        {
          id: 'plantao',
          heading: 'On-call duty',
          paragraphs: [
            'On-call duty covers critical tickets 24 hours a day, on a weekly rotation. Whoever is on call receives a standby allowance and must respond to an alert within 15 minutes.',
          ],
        },
        {
          id: 'encerramento',
          heading: 'Closing tickets',
          paragraphs: [
            'A ticket is only closed after the client confirms the fix or after 3 business days without a reply. Every closed ticket records the cause and the knowledge base article used, if any.',
          ],
        },
      ],
    },
    {
      id: 'compras',
      title: 'Purchasing and suppliers',
      owner: 'Procurement',
      updated: '2026-02',
      summary: 'Approval levels, quotes, supplier registration, and payment.',
      sections: [
        {
          id: 'quando',
          heading: 'When to open a purchase',
          paragraphs: [
            'Every purchase of products or services for the company goes through the Purchasing Portal, even when the supplier is already known. Software subscriptions follow the same process.',
          ],
        },
        {
          id: 'alcadas',
          heading: 'Approval levels',
          paragraphs: [
            'Purchases up to R$ 2,000 only need your manager\'s approval. Between R$ 2,000 and R$ 20,000, the department director also approves; above R$ 20,000, the purchase goes to the Purchasing Committee, which meets on Wednesdays.',
            'Purchases above R$ 5,000 require three quotes from different suppliers, unless there is a justified sole supplier.',
          ],
        },
        {
          id: 'cadastro',
          heading: 'Supplier registration',
          paragraphs: [
            'New suppliers are registered by Procurement, with an active company tax ID, clearance certificates, and a bank account in the company\'s name. Registration takes up to 5 business days.',
          ],
        },
        {
          id: 'pagamento',
          heading: 'Paying suppliers',
          paragraphs: [
            'Supplier invoices must reach Procurement within 3 days of receipt. Payments go out on the 10th and 25th of each month, at least 15 days after the invoice is issued.',
          ],
        },
        {
          id: 'conflito',
          heading: 'Conflicts of interest',
          paragraphs: [
            'Anyone with a personal or business relationship with a supplier must declare the conflict and stays out of the selection. Supplier gifts worth more than R$ 150 must be politely declined.',
          ],
        },
      ],
    },
  ],
};
