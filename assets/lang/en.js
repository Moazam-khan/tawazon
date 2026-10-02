/* English strings. Keys must match ar.js exactly (node tools/check.js).
   Wording follows docs/WORDS.md. */
window.TZ = window.TZ || {};
TZ.LANGS = TZ.LANGS || {};

TZ.LANGS.en = {
  brand: { name: 'Tawazon Plus', short: 'Tawazon' },
  lang: { en: 'English', ar: 'العربية', switchTo: 'العربية', switchAria: 'Switch to Arabic' },
  common: {
    undo: 'Undo',
    close: 'Close',
    save: 'Save',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    add: 'Add',
    edit: 'Edit',
    remove: 'Remove',
    delete: 'Delete',
    cancel: 'Cancel',
    keep: 'Keep it',
    yes: 'Yes',
    no: 'No',
    skip: 'Skip for now',
    seeAll: 'See all',
    tryAgain: 'Try again',
    gotIt: 'Got it',
    today: 'Today',
    tomorrow: 'Tomorrow',
    perDay: 'a day',
    perMonth: 'a month',
    perYear: 'a year',
    days: { one: '{n} day', other: '{n} days' },
    oneDay: '1 day',
    monthly: 'Monthly',
    yearly: 'Yearly',
    name: 'Name',
    amount: 'Amount',
    loading: 'One moment…',
    saved: 'Saved',
    removed: 'Removed'
  },
  state: {
    default: 'Default',
    pressed: 'Pressed',
    disabled: 'Disabled',
    focus: 'Focus',
    selected: 'Selected',
    on: 'On',
    off: 'Off'
  },
  ds: {
    title: 'Design system',
    lead: 'Colors, type and components for Tawazon Plus, in English and Arabic side by side.',
    pageLang: 'Page language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    textSize: 'Text size',
    sizeNormal: 'Normal',
    sizeLarge: 'Large',
    sizeXlarge: 'Extra large',
    digits: 'Numbers',
    digitsLatn: '123',
    digitsArab: '١٢٣',
    frameCaption: 'English · left to right',
    sync: 'Scroll both together',
    section: {
      mascot: 'Meet Tawazon',
      colors: 'Colors',
      typography: 'Type',
      buttons: 'Buttons',
      amount: 'Amount and keypad',
      chips: 'Preset chips',
      status: 'Status',
      cards: 'Cards and rows',
      progress: 'Progress',
      controls: 'Switch and choice',
      tabbar: 'Tab bar',
      overlays: 'Toast, sheet and confirm',
      empty: 'Empty state'
    }
  },
  color: {
    brand: 'Brand',
    sand: 'Sand',
    good: 'Good',
    careful: 'Go easy',
    tight: 'Tight',
    surface: 'Surface',
    text: 'Text'
  },
  typo: { aa: 'Aa', hero: 'Hero number', title: 'Title', body: 'Body', small: 'Small', sample: 'You can spend today' },
  btn: {
    primary: 'Continue',
    secondary: 'Not now',
    text: 'Skip for now',
    danger: 'Delete',
    primaryName: 'Primary',
    secondaryName: 'Secondary',
    textName: 'Text',
    dangerName: 'Gentle warning'
  },
  amount: {
    label: 'Your monthly salary',
    looksHigh: 'Is that right? {amount} looks high.',
    keypad: 'Number keypad',
    backspace: 'Delete last digit',
    double: '00'
  },
  preset: {
    rent: 'Rent',
    electricity: 'Electricity',
    internet: 'Internet',
    phone: 'Phone',
    subscription: 'Subscriptions',
    other: 'Other',
    bills: 'Bills',
    water: 'Water',
    car: 'Car',
    school: 'School fees',
    family: 'Family support',
    worker: 'Home helper',
    loan: 'Loan payment'
  },
  home: {
    canSpendToday: 'You can spend today',
    leftOver: 'Left over this month',
    title: 'Home',
    greet: { morning: 'Good morning, {name}', afternoon: 'Good afternoon, {name}', evening: 'Good evening, {name}' },
    daysUntil: { one: '{n} day until your salary', other: '{n} days until your salary' },
    oneDayUntil: 'Your salary is tomorrow',
    salaryOn: 'Salary {date}',
    howLink: 'How is this calculated?',
    fromCheck: 'Based on what you told us today',
    actions: {
      spend: 'Can I spend…?',
      spendSub: 'Check before you buy',
      update: 'Update my money',
      updateSub: 'Tell us what you have now'
    },
    check: {
      title: 'How much money do you have now?',
      label: 'Money you can spend',
      helper: 'Count only money you can spend. Leave out rent or bills you still have to pay.',
      toast: 'Your daily number: {from} → {to} SAR',
      same: 'Thanks! Your daily number stays {to} SAR.'
    },
    upcoming: {
      title: 'Coming up',
      markPaid: 'I paid it',
      markAria: 'Mark {name} as paid',
      inDays: { one: '{date} · tomorrow', other: '{date} · in {n} days' },
      tomorrow: '{date} · tomorrow',
      today: '{date} · today',
      paidOn: 'Paid · {date}',
      toast: 'Nice! {name} is paid. It was already set aside, so your daily number doesn’t change.',
      debtName: '{name} payment'
    },
    owed: { title: '{name} owes you', sub: 'When it’s paid back, your daily number goes up' },
    tip: {
      good: 'Spending less today makes tomorrow’s number bigger.',
      careful: 'A few calm days and your number grows again.',
      tight: 'Tight days pass. Keep today simple. It gets easier.',
      check: 'Thanks for updating. Your number is up to date now.'
    },
    demo: { good: 'Looking good', careful: 'Go easy', tight: 'Tight', check: 'After updating my money' },
    season: {
      title: '{name} in about {months}',
      months: { one: '{n} month', other: '{n} months' },
      sub: 'Save about {amount} a month to be ready',
      subOn: 'You’re saving for it. Well done.'
    }
  },
  status: { good: 'Looking good', careful: 'Go easy today', tight: 'A tight day' },
  card: { next: 'Next', rentIn: 'Rent in {n} days', hero: 'Hero card' },
  row: {
    rent: 'Rent',
    rentSub: 'Due in {n} days',
    person: 'Ahmed',
    personSub: 'Owes you',
    debt: 'Car loan',
    debtSub: '{amount} left'
  },
  progress: { day: 'Day {day} of {total} until your salary', debt: 'Paid so far' },
  control: { reminder: 'Morning reminder', aloud: 'Read numbers aloud', language: 'Language' },
  tab: { home: 'Home', money: 'My money', ask: 'Ask' },
  overlay: {
    showToast: 'Show a toast',
    openSheet: 'Open bottom sheet',
    openModal: 'Open confirm',
    toastName: 'Toast with Undo',
    sheetName: 'Bottom sheet',
    modalName: 'Confirm',
    toastChanged: 'Daily number: {from} → {to}',
    toastAdded: 'Payment added',
    sheetTitle: 'Add a fixed payment',
    sheetHint: 'How much is it each month?',
    modalTitle: 'Delete this payment?',
    modalText: 'You can undo this for {n} seconds.',
    modalConfirm: 'Delete',
    modalKeep: 'Keep it'
  },
  empty: {
    title: 'Nothing here yet',
    text: 'Add your first fixed payment, and we\'ll do the math.',
    action: 'Add a payment'
  },
  mascot: { hello: 'Hi! I\'m Tawazon. I\'ll keep things simple.', happy: 'Happy', calm: 'Calm' },
  nav: { main: 'Main menu', settings: 'Settings' },
  demo: {
    title: 'Screen state (for review)',
    allScreens: 'All screens',
    prev: 'Previous screen',
    next: 'Next screen',
    position: 'Screen {n} of {total}',
    states: 'States',
    tools: 'Review tools'
  },
  mock: { carLoan: 'Car loan', ahmed: 'Ahmed', sara: 'Sara', goalUmrah: 'Umrah trip', you: 'Abdullah' },
  check: {
    zero: 'Please enter an amount.',
    high: 'Is that right? {amount} looks high.',
    low: 'Is that right? {amount} looks low for a monthly salary.',
    moreThanSalary: 'That’s more than your salary. Is it right?'
  },
  ask: {
    title: 'Ask',
    newChat: 'New chat',
    cleared: 'Chat cleared',
    hello: 'Hi {name}! Tap a question, or ask in your own words.',
    advice: 'Guidance, not financial advice.',
    cardsTitle: 'Questions I can always answer',
    cardsMore: 'Ask another question',
    typing: 'Tawazon is typing…',
    q: {
      spend: 'Can I spend {amount} today?',
      spendSub: 'Check before you buy',
      why: 'Why did my number change?',
      whySub: 'See what changed, and when',
      debt: 'When will I pay off my debt?',
      debtSub: 'See when you’ll be free of it',
      goal: 'How much should I save for my goal?',
      goalSub: 'One simple amount each month'
    },
    chip: { spend: 'Can I spend {amount}?', why: 'Why did it change?', debt: 'My debt', goal: 'My goal' },
    spend: {
      sheetTitle: 'How much do you want to spend?',
      sheetLabel: 'Amount to spend today',
      checkBtn: 'Check it',
      fits: 'Yes! {amount} fits in today’s {today}. Enjoy!',
      over: '{amount} is more than today’s {today}. That’s okay now and then.',
      tomorrow: 'If you spend it, you can spend about {tomorrow} a day from tomorrow.',
      tooMuch: '{amount} is more than all the money you can use until your salary ({left}).',
      wait: 'It may be best to wait for your salary on {date}.',
      barToday: 'Today',
      barTomorrow: 'From tomorrow',
      note: 'Just a check. Your number stays the same.'
    },
    why: {
      intro: 'Here is what changed your number lately:',
      savings: 'You added {amount} to savings',
      paid: '{name} paid: {amount}',
      received: '{name} paid you back {amount}',
      same: 'No change. It was already set aside.',
      outro: 'Your number only changes when money comes in, you add to savings, pay extra, or update your money.'
    },
    debt: {
      answer: 'You’ll be done with your {name} in {month}. {n} payments left. The last one is {last}.',
      answerOne: 'You’ll be done with your {name} in {month}. Just one payment of {last} left.',
      progress: 'Paid {paid} of {total}',
      none: 'You don’t owe any money right now. Well done!'
    },
    goal: {
      answer: 'Save about {amount} a month to reach {name} ({target}) by {month}.',
      progress: '{saved} of {target} saved',
      note: 'Goals don’t change your daily number.',
      none: 'You don’t have a goal yet. Add one in My money, and I’ll tell you how much to save each month.'
    },
    ai: {
      badge: 'Smart answers',
      tag: 'Smart answer',
      label: 'Ask in your own words',
      placeholder: 'Type your question…',
      mic: 'Ask with your voice',
      micStop: 'Stop listening',
      listening: 'Listening… speak now',
      send: 'Send',
      status: { resting: 'Resting', offline: 'Offline', limit: 'Back tomorrow' },
      sampleQ: 'How are my savings going?',
      sampleA: 'You have {total} in savings. You added {last} on {date}, and the same the month before. Slow and steady, that’s how it grows.',
      unclearQ: 'what about the thing from before?',
      unclear: 'Sorry, I didn’t quite understand. Try one of these:',
      resting: 'Smart answers are taking a short rest. These questions still work:',
      restingHint: 'Try again in a little while. The questions above still work.',
      offline: 'You’re offline. The questions still work. Smart answers come back when you’re connected.',
      offlineHint: 'Connect to the internet to ask in your own words.',
      limit: 'We talked a lot today! Smart answers are back tomorrow morning. The questions always work.',
      limitPlan: 'After your free trial, smart answers are part of the Plus plan.',
      limitLink: 'See the plan',
      limitHint: 'Tap any question above. They always work.'
    },
    consent: {
      title: 'Before your first smart answer',
      amounts: 'To answer, our AI helper gets your question and your amounts, like salary and payments.',
      private: 'Never your name, phone number or bank details.',
      off: 'You can turn smart answers off anytime in Settings.',
      agree: 'I agree',
      notNow: 'Not now',
      later: 'No problem. The questions always work.'
    },
    match: {
      spend: 'spend|buy|afford|purchase',
      why: 'change|why|went down|went up|dropped',
      debt: 'debt|loan|owe|finish|pay off|installment',
      goal: 'goal|umrah|trip|wedding',
      savings: 'saving|save|put aside'
    },
    demo: {
      on: 'Smart answers on',
      resting: 'Smart answers resting',
      offline: 'Offline',
      limit: 'Daily limit reached',
      consent: 'First-time consent',
      unclear: 'Didn’t understand'
    }
  },
  debtDetails: {
    docTitle: 'Money I owe',
    title: '{name}',
    paidSoFar: 'Paid so far',
    pct: '{n}%',
    paidOf: '{paid} of {total} paid',
    left: 'Left to pay',
    monthly: 'Monthly payment',
    next: 'Next payment',
    finishTitle: 'All paid by {month}',
    finishText: '{n} payments left. The last one is {amount}.',
    finishTextOne: 'Just one payment left: {amount}. Almost there!',
    history: 'Payments made',
    paymentRow: 'Payment',
    noPayments: 'No payments yet. Add one here each time you pay.',
    addPayment: 'Add a payment',
    sheetTitle: 'Add a payment',
    sheetLabel: 'How much did you pay?',
    tooMuch: 'That\'s more than what\'s left ({amount}).',
    extraHint: 'That\'s {extra} more than this month\'s payment. The extra comes out of what you can spend until salary.',
    savedToast: 'Payment of {amount} saved.',
    niceTitle: 'Nice! One more payment done. {n} to go.',
    niceText: 'Your daily number stays {amount}. This payment was already put aside.',
    extraTitle: 'You paid {extra} extra. You\'re closer to the finish!',
    extraText: 'The extra comes out of what you can spend until salary, so your daily number goes from {from} to {to}.',
    partTitle: 'Payment saved.',
    partText: '{amount} left for this month\'s payment. Your daily number stays the same.',
    doneTitle: 'All paid off!',
    doneText: 'You\'ve paid off {name}. Well done! From your next salary, {amount} a month is yours again.',
    doneBadge: 'Paid off',
    backToMoney: 'Back to My money',
    edit: 'Change details',
    remove: 'Remove this debt',
    removedTitle: '{name} was removed',
    removedText: 'Changed your mind? You can bring it back.',
    bringBack: 'Bring it back',
    notFoundTitle: 'We couldn\'t find this debt',
    notFoundText: 'Let\'s go back to My money and find it together.',
    demo: { plan: 'On track', last: 'One payment left', done: 'All paid off' }
  },
  gallery: {
    title: 'All screens',
    subtitle: 'Design prototype · English and Arabic',
    lead: 'Every Tawazon Plus screen, in the order people meet them. Open any screen, switch the language inside it, and try it like a real app.',
    startFlow: 'Try it from the start',
    designSystem: 'Design system',
    theme: 'Light or dark',
    previews: 'Show previews',
    reset: 'Reset sample data',
    resetDone: 'Sample data is back to the start.',
    states: 'States:',
    open: 'Open',
    openOther: 'العربية',
    sampleNote: 'Every screen uses the same sample person: salary {salary} on day {day}, and today is {today}.',
    foot: 'A design prototype. Numbers are examples. The real calculation comes later.',
    fact: {
      daily: 'You can spend today',
      salary: 'Salary',
      setAside: 'Set aside each month',
      days: 'Days until salary'
    },
    group: {
      start: 'Getting started',
      daily: 'Every day',
      money: 'My money',
      account: 'Plan and account',
      moments: 'Special moments'
    },
    screen: {
      welcome: { name: 'Welcome', desc: 'The first screen. One promise, one button.' },
      setup: {
        name: 'Setup',
        desc: 'Three questions: salary, salary day and fixed payments. Your number appears as you type.'
      },
      reveal: { name: 'Your number', desc: 'The moment your daily number appears for the first time.' },
      home: { name: 'Home', desc: 'Your daily number, how the month is going and what\'s coming up.' },
      howCalculated: { name: 'How it\'s calculated', desc: 'The math as a picture, step by step. No formulas.' },
      ask: { name: 'Ask', desc: 'Question cards that always work, plus optional smart answers.' },
      myMoney: { name: 'My money', desc: 'Money I owe, fixed payments, people owe me, savings and goals.' },
      myMoneyDebtDetails: { name: 'Debt details', desc: 'One debt: how much is paid, past payments and when it ends.' },
      paywall: { name: 'Free trial', desc: 'Honest plans, easy to close. The daily number stays free.' },
      login: {
        name: 'Save my data',
        desc: 'Sign in with Apple or Google, and what happens if you already have saved data.'
      },
      settings: { name: 'Settings', desc: 'Language, text size, reminders, privacy and account.' },
      states: {
        name: 'Special moments',
        desc: 'A hard month, salary day, a paid-off debt, offline, first tour and notifications.'
      },
      seasons: {
        name: 'Big months',
        desc: 'Ramadan, Eid, summer and school: set aside a little each month, so they\'re no surprise.'
      }
    }
  },
  howCalculated: {
    title: 'How we got your number',
    lead: 'Your month, step by step. Tap a line to learn more.',
    salary: 'Salary',
    salaryInfo: 'The money you get each month, on day {day}.',
    fixedInfo: 'Set aside first, so it’s ready on day {day}.',
    fixedYearlyInfo: 'A yearly payment. We set aside a little each month.',
    debtName: '{name} payment',
    debtInfo: 'Your planned monthly payment. Set aside like a bill.',
    paidTag: 'Paid',
    paidInfo: 'Paid this month. It still counts in this month’s plan.',
    changes: 'Changes this month',
    changesInfo: 'Money you saved or received, or your latest money update.',
    use: 'Money I can use',
    useInfo: 'What’s left for daily life: food, fuel, going out.',
    shared: { one: 'For {n} day', other: 'Split over {n} days' },
    sharedInfo: 'From today until your salary on {date}. Today counts.',
    perDay: 'a day',
    barTitle: 'Your salary, split up',
    barAria: 'Your salary of {salary}: {list}',
    note: 'Paying a planned debt payment doesn’t change your number. It’s already set aside.',
    replay: 'Replay',
    stepsAria: 'Your month, step by step'
  },
  login: {
    title: 'Save your data',
    headline: 'Keep your data safe',
    lead: 'New phone or lost phone? You won’t lose anything. Sign in once and your numbers stay with you.',
    keepsTitle: 'What we keep safe',
    keeps1: 'Your salary and fixed payments',
    keeps2: 'Money you owe and money people owe you',
    keeps3: 'Your savings and goals',
    apple: 'Continue with Apple',
    google: 'Continue with Google',
    appleName: 'Apple',
    googleName: 'Google',
    later: 'Maybe later',
    privacy: 'We never see your bank. We only save the amounts you type.',
    found: {
      title: 'You already have saved data',
      lead: 'This account has data from before. Which one should we keep?',
      phone: 'Keep the data on this phone',
      phoneMeta: 'Changed today',
      saved: 'Keep my saved data',
      savedMeta: 'Saved on {date}',
      summary: 'Salary {amount} SAR · Payments: {n}',
      note: 'We’ll keep only the one you choose and delete the other.',
      confirm: 'Keep this one',
      pickFirst: 'Choose one to continue',
      askPhoneTitle: 'Keep the data on this phone?',
      askSavedTitle: 'Keep your saved data?',
      askText: 'The other data will be removed. This can’t be undone.',
      askYes: 'Yes, keep this one',
      askNo: 'Let me look again'
    },
    done: {
      title: 'Your data is saved',
      text: 'You are signed in with {provider}. On a new phone, sign in the same way and everything comes back.',
      with: 'Signed in with',
      lastSaved: 'Last saved',
      cta: 'Go to my daily number'
    },
    demo: { start: 'Sign in', found: 'Account already has data', done: 'Signed in' }
  },
  myMoney: {
    title: 'My money',
    tabsLabel: 'Parts of my money',
    tab: {
      owe: 'Money I owe',
      fixed: 'Fixed payments',
      owed: 'People owe me',
      savings: 'Savings',
      goals: 'Goals',
      overview: 'Overview'
    },
    demo: { filled: 'With sample money', empty: 'Empty (first time)' },
    change: 'Your daily number: {from} → {to}',
    stays: 'Your daily number stays {amount}.',
    undone: 'Back as it was.',
    added: '{name} added.',
    changed: '{name} updated.',
    removeTitle: 'Remove {name}?',
    removeText: 'You can undo it right after.',
    removed: '{name} removed.',
    editAria: 'Change {name}',
    removeAria: 'Remove {name}',
    editTitle: 'Change {name}',
    form: {
      name: 'Name',
      nameNeeded: 'Please write a name.',
      pick: 'Pick one, or type a name below',
      every: 'How often?',
      day: 'Which day of the month?',
      month: 'Which month?',
      byWhen: 'When do you need it?',
      dayN: 'Day {n}'
    },
    owe: {
      sumLabel: 'Money you owe, in total',
      sumLine: 'You pay {amount} a month',
      perMonth: '{amount} a month',
      leftAmount: '{amount} left',
      paidPct: 'Paid {n}%',
      endsIn: 'Ends {month}',
      allPaid: 'All paid',
      add: 'Add money I owe',
      addTitle: 'Add money I owe',
      leftLabel: 'How much is left to pay?',
      monthlyTitle: 'How much do you pay each month?',
      monthlyLabel: 'Each month',
      payDay: 'Which day do you pay?',
      moreThanLeft: 'That\'s more than what\'s left ({amount}). Is that right?',
      note: 'We set aside your monthly payments from your salary first. So your daily number is safe to spend.',
      emptyTitle: 'You don\'t owe anyone money',
      emptyText: 'Paying something off bit by bit, like a loan? Add it here and we\'ll plan the payments with you.',
      preset: {
        car: 'Car loan',
        personal: 'Personal loan',
        card: 'Credit card',
        family: 'Family or friend',
        other: 'Other'
      }
    },
    fixed: {
      sumLabel: 'Fixed payments each month',
      sumLine: '{paid} of {count} paid this month',
      everyMonth: 'Every month',
      everyYear: 'Every year',
      due: 'Due {date}',
      nextDue: 'Next {date}',
      paidTag: 'Paid',
      markPaid: 'Mark as paid',
      markPaidAria: 'Mark as paid: {name}',
      perYear: '{amount} a year',
      share: 'That\'s {amount} a month',
      spread: 'We spread yearly payments over 12 months for you.',
      spreadExample: 'For example, {year} a year counts as {month} a month.',
      paidNote: 'Marking it paid won\'t change your daily number. That money was already set aside.',
      paidToast: 'Nice! {name} is paid. Your daily number stays {amount}.',
      add: 'Add a fixed payment',
      addTitle: 'Add a fixed payment',
      labelMonth: 'How much each month?',
      labelYear: 'How much each year?',
      emptyTitle: 'No fixed payments yet',
      emptyText: 'Add what you pay every month or every year, like rent or the internet.'
    },
    owed: {
      sumLabel: 'People owe you, in total',
      sumLine: 'When you get it back, your daily number goes up.',
      since: 'Since {date}',
      receive: 'Mark as received',
      receiveAria: 'Mark as received: {name}',
      received: 'You got your money back from {name}. Your daily number: {from} → {to}',
      add: 'Add someone who owes me',
      addTitle: 'Who owes you money?',
      nameLabel: 'Their name',
      amountLabel: 'How much do they owe you?',
      emptyTitle: 'Nobody owes you money',
      emptyText: 'Lent someone money? Add it here so it doesn\'t get forgotten.'
    },
    savings: {
      sumLabel: 'Your savings',
      sumLine: 'Kept safe, away from your daily spending.',
      add: 'Add to savings',
      addTitle: 'Add to savings',
      amountLabel: 'How much are you adding?',
      note: 'Money you save comes out of what you can spend until salary. So your daily number goes down a little.',
      preview: 'Your daily number: {from} → {to}',
      history: 'Added so far',
      entry: 'Added to savings',
      takeOutAria: 'Take {amount} out of savings',
      takeOutTitle: 'Take {amount} out of savings?',
      takeOutText: 'It goes back to what you can spend, and your daily number goes up.',
      takeOutYes: 'Take it out',
      addedToast: 'Nice! {amount} saved. Your daily number: {from} → {to}',
      takenToast: '{amount} is back for spending. Your daily number: {from} → {to}',
      emptyTitle: 'No savings yet',
      emptyText: 'Even a little helps. Add some when you can.'
    },
    goals: {
      sumLabel: 'Saved for your goals',
      sumLine: 'Out of {amount} in total',
      note: 'Goals don\'t change your daily number. They help you plan.',
      by: 'By {month}',
      progress: '{saved} of {target}',
      pct: '{n}%',
      suggest: 'Save about {amount} a month',
      reached: 'Goal reached. Well done!',
      addMoney: 'Add money',
      addMoneyAria: 'Add money: {name}',
      addMoneyTitle: 'Add to {name}',
      addMoneyLabel: 'How much did you save for it?',
      moneyAdded: 'Nice! {amount} added to {name}. Your daily number stays {daily}.',
      reachedToast: 'You reached your goal: {name}. Well done!',
      add: 'Add a goal',
      addTitle: 'Add a goal',
      targetLabel: 'How much do you need?',
      emptyTitle: 'No goals yet',
      emptyText: 'Saving for something, like Umrah or a car? Add it and we\'ll show you how much to save each month.',
      preset: {
        umrah: 'Umrah',
        car: 'A car',
        wedding: 'Wedding',
        emergency: 'For emergencies',
        travel: 'Travel',
        other: 'Other'
      },
      seasonsTitle: 'Big months',
      seasonsSub: 'Ramadan, Eid, summer and school. Get ready a little each month.'
    },
    dash: {
      lead: 'Everything about your money in one place. Tap a box to see more.',
      back: 'Back to My money',
      owe: 'You pay {amount} a month',
      oweNone: 'You don\'t owe anyone',
      fixed: { one: '{n} payment each month', other: '{n} payments each month' },
      owed: { one: '{n} person owes you', other: '{n} people owe you' },
      savings: 'Saved so far',
      goals: 'Saved out of {amount}',
      goalsNone: 'No goals yet',
      none: 'Nothing added yet',
      note: 'Fixed payments and debt payments are set aside first. That\'s why your daily number is safe to spend.'
    }
  },
  paywall: {
    title: 'Tawazon Plus',
    closeAria: 'Close and go to Home',
    eyebrow: 'Tawazon Plus',
    headline: 'Try free for {n} days',
    lead: 'A few extras that make money questions easier.',
    day3Headline: 'Your free days are almost over',
    day3Lead: 'Your free days end on {date}. Pick a plan to keep the extras.',
    benefitsTitle: 'What you get',
    b1: 'Smart answers to your money questions',
    b2: 'Export your data to Excel',
    b3: 'Reminders before a payment is due',
    remind: 'We will remind you a day before your free days end.',
    freeForever: 'Your daily number stays free forever.',
    plansTitle: 'Choose a plan',
    save: 'You save {amount}',
    priceYear: '{amount} a year',
    priceMonth: '{amount} a month',
    about: 'about {amount} a month',
    billedMonthly: 'Paid every month',
    cta: 'Start my free trial',
    ctaDay3: 'Keep Tawazon Plus',
    termsYear: 'Free for {n} days, then {amount} a year. Cancel anytime in your phone settings, at least {h} hours before the trial ends.',
    termsMonth: 'Free for {n} days, then {amount} a month. Cancel anytime in your phone settings, at least {h} hours before the trial ends.',
    termsDay3Year: 'Free until {date}, then {amount} a year. To stop, cancel in your phone settings at least {h} hours before.',
    termsDay3Month: 'Free until {date}, then {amount} a month. To stop, cancel in your phone settings at least {h} hours before.',
    restore: 'Restore purchases',
    restoreToast: 'We looked, but found no past purchase on this phone.',
    later: 'Maybe later',
    successTitle: 'Welcome to Tawazon Plus',
    successText: 'Your {n} free days start today. We will remind you a day before they end.',
    successKeep: 'Thank you! Your plan starts on {date}. Nothing changes until then.',
    successPlan: 'Your plan',
    successStarts: 'First payment',
    successCancel: 'You can cancel anytime in your phone settings.',
    successCta: 'Go to my daily number',
    demo: { reveal: 'After the reveal', day3: 'Day 3 · free days ending', success: 'Trial started' }
  },
  reveal: {
    title: 'Your daily number',
    math: 'Doing the math…',
    mathSub: 'Just a moment.',
    stepSalary: 'Your salary',
    stepSetAside: 'Fixed payments set aside',
    stepDays: 'Days until your salary',
    daysLeft: { one: 'From salary to salary: {n} day left', other: 'From salary to salary: {n} days left' },
    same: 'Spend about this each day, and it stays the same until your salary.',
    live: 'You can spend {amount} today.',
    how: 'How is this calculated?',
    zero: 'Your fixed payments are more than your salary this month. Let’s look at it together.',
    demo: { play: 'Play the reveal', math: 'Doing the math', result: 'Your number' }
  },
  settings: {
    title: 'Settings',
    sec: {
      look: 'Language and display',
      reminders: 'Reminders',
      safety: 'Privacy and safety',
      account: 'Account and plan',
      about: 'About'
    },
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    digits: 'Number style',
    digitsSub: 'Used when the app is in Arabic',
    digitsLatn: '123',
    digitsArab: '١٢٣',
    digitsLatnAria: 'Western numbers, 123',
    digitsArabAria: 'Arabic numbers, ١٢٣',
    digitsGlyph: '1',
    textSize: 'Text size',
    sizeGlyph: 'Aa',
    sizeA: 'A',
    sizeNormal: 'Normal',
    sizeLarge: 'Large',
    sizeXlarge: 'Extra large',
    reminder: 'Morning reminder',
    reminderSub: 'Your daily number, every morning',
    reminderTime: 'Reminder time',
    timeTitle: 'When should we remind you?',
    timeHint: 'Pick a time. You can change it any time.',
    notifications: 'Payment reminders',
    notificationsSub: 'A gentle note before a payment is due',
    biometric: 'Lock with fingerprint or face',
    biometricSub: 'Only you can open the app',
    ai: 'Smart answers',
    aiSub: 'Ask in your own words. Your question and amounts go to our AI helper.',
    save: 'Save your data',
    saveSub: 'Not saved yet. Save it so nothing is lost if you change phones.',
    saved: 'Your data is saved',
    savedSub: 'Signed in with {provider}',
    appleName: 'Apple',
    googleName: 'Google',
    plan: 'Your plan',
    planTrial: 'Free trial · {days} left',
    planYear: 'Tawazon Plus · Yearly',
    planMonth: 'Tawazon Plus · Monthly',
    planFree: 'Free plan',
    export: 'Download my data',
    exportSub: 'A file you can open in Excel',
    plusTag: 'Plus',
    exportDone: 'Your file is ready. Look in your Downloads.',
    delete: 'Delete my account',
    deleteSub: 'Deletes everything for good',
    del1Title: 'Delete your account?',
    del1Text: 'This deletes your salary, payments, money you owe, savings and goals, from this phone and from your account.',
    del1Yes: 'Continue',
    del1No: 'Keep my account',
    del2Title: 'Are you sure?',
    del2Text: 'This can’t be undone. It doesn’t cancel your plan. To stop paying, cancel in your phone settings.',
    del2Yes: 'Yes, delete everything',
    deleted: 'Your account is deleted. You can start fresh any time.',
    privacy: 'Privacy policy',
    privacySub: 'What we save, in plain words',
    privacyTitle: 'Your privacy, in short',
    p1: 'We never connect to your bank.',
    p2: 'We only save the amounts you type.',
    p3: 'We never sell your data.',
    p4: 'You can delete everything at any time.',
    about: 'About Tawazon Plus',
    version: 'Version {v} · design preview',
    signOut: 'Sign out',
    signOutTitle: 'Sign out?',
    signOutText: 'Your data stays saved in your account. Sign in again any time to get it back.',
    signOutNo: 'Stay signed in',
    signedOut: 'You’re signed out. Your data is safe in your account.',
    demo: { guest: 'Data not saved yet', signedIn: 'Signed in' }
  },
  setup: {
    title: 'Set up',
    progress: 'Question {n} of {total}',
    example: 'Try with example numbers',
    exampleDone: 'Example numbers added. Change anything you like.',
    salary: {
      q: 'How much is your monthly salary?',
      hint: 'The amount that reaches your bank each month.',
      label: 'Monthly salary'
    },
    day: {
      q: 'What day do you get paid?',
      hint: 'Pick the day your salary usually arrives.',
      last: 'Last day of the month',
      next: 'Next salary: {date}',
      count: '{days} to go, counting today',
      short: 'If a month has no day {day}, we use its last day.',
      lastNote: 'We use the last day of every month, whether it has {a}, {b} or {c} days.'
    },
    pay: {
      q: 'What fixed payments do you have?',
      hint: 'Money you pay every month or every year. Tap one to add it.',
      yours: 'Your fixed payments',
      add: 'Add a payment',
      addMore: 'Add another',
      label: 'How much do you pay?',
      often: 'How often?',
      yearlyNote: 'We spread yearly payments over {n} months.',
      perMonthNote: 'That’s about {amount} a month.',
      loanNote: 'We’ll add this to Money I owe.',
      nameLabel: 'What’s it for? (optional)',
      everyMonth: 'Every month',
      everyYear: 'Every year · spread over {n} months',
      owe: 'Money I owe',
      total: 'Set aside each month',
      removeAria: 'Remove {name}',
      removed: '{name} removed',
      none: 'No fixed payments? That’s fine. You can add them later.'
    },
    preview: {
      label: 'Your number so far',
      value: 'about {amount} a day',
      kept: 'Your fixed payments are set aside first.',
      tight: 'Your payments are more than your salary. Let’s look at it together.'
    },
    finish: 'Show my number',
    demo: {
      step1: 'Question 1 · Salary',
      step2: 'Question 2 · Pay day',
      step3: 'Question 3 · No payments',
      step3Filled: 'Question 3 · Payments added'
    }
  },
  states: {
    title: 'Special moments',
    demo: {
      badMonth: 'Payments bigger than salary',
      salaryDay: 'Salary day',
      debtPaid: 'Debt fully paid',
      moneyReceived: 'Money received',
      offline: 'Offline',
      error: 'Could not load',
      emptyHome: 'Before setup',
      tour: 'First-time tour',
      notifications: 'Notifications',
      widget: 'Home-screen widget'
    },
    home: {
      daysLeft: { one: '{n} day until your salary', other: '{n} days until your salary' },
      next: 'Next payment'
    },
    bad: {
      message: 'Your payments are bigger than your salary this month. Let’s look at it together.',
      zero: 'Your number shows 0 for now. It never goes below zero.',
      salary: 'Salary',
      payments: 'Payments this month',
      short: 'Short by',
      ideaTitle: 'One idea that helps',
      idea: 'Ask to move the {name} payment ({amount}) to next month.',
      ideaResult: 'Then you’d have {left} left this month, about {daily} a day.',
      seePayments: 'Look at my payments',
      later: 'Remind me tomorrow',
      laterToast: 'Okay. I’ll remind you tomorrow.'
    },
    salary: {
      title: 'Salary day!',
      text: 'Your salary is here. A fresh start until {date}.',
      newNumber: 'From today you can spend',
      leftQ: 'You have {amount} left over from last month. Move it to savings?',
      yes: 'Yes, move it',
      yesSub: 'Your savings become {total}',
      keep: 'Keep it for spending',
      keepSub: 'About {daily} a day instead of {base}',
      movedToast: '{amount} moved to savings',
      keptToast: '{amount} kept for spending',
      moved: 'Done! {amount} is in your savings now.',
      kept: 'Done! You can spend about {daily} a day.'
    },
    debt: {
      title: '{name} fully paid!',
      text: 'Well done, {you}. You paid {total} in total, one payment at a time.',
      meansTitle: 'What this means',
      means: '{amount} a month is free again. Your daily number goes up from your next salary.',
      progress: 'Paid {paid} of {total}',
      seeMoney: 'See my money',
      home: 'Back to home'
    },
    received: {
      title: '{name} paid you back {amount}',
      before: 'Before',
      now: 'Now',
      why: {
        one: 'It’s all yours today: {plus} more.',
        other: 'We spread it over the {n} days until your salary: about {plus} more a day.'
      },
      upBy: '{n} more a day',
      undoToast: 'Back to {amount} a day'
    },
    offline: {
      title: 'You’re offline',
      text: 'This is your last saved number. It updates by itself when you’re back online.',
      saved: 'Last saved this morning'
    },
    error: {
      title: 'Something didn’t load',
      text: 'It’s not you. Check your internet, then try again.',
      ok: 'All good again',
      home: 'Back to home'
    },
    empty: {
      title: 'Let’s set up your number',
      text: 'Three quick questions: your salary, your salary day and your fixed payments. It takes about a minute.',
      btn: 'Set up my number'
    },
    tour: {
      label: 'Quick tour',
      s1Title: 'Your daily number',
      s1: 'Spend up to this today and you’re on track. It updates by itself.',
      s2Title: 'How today looks',
      s2: 'Looking good, go easy, or a tight day. Always with a face and a word.',
      s3Title: 'Questions? Ask me',
      s3: 'Tap Ask anytime. I’ll answer in simple words.',
      step: 'Step {n} of {total}',
      skip: 'Skip tour',
      start: 'Let’s start',
      replay: 'Show the tour again'
    },
    notif: {
      lock: 'Lock screen preview',
      now: 'now',
      c1: 'Every morning',
      c2: 'Before a payment is due',
      c3: 'Day {n} of the free trial',
      morningTitle: 'Good morning!',
      morning: 'You can spend {amount} today.',
      billsTitle: 'Payment coming up',
      bills: '{name}: {amount} due in {days}.',
      inDays: { one: '{n} day', other: '{n} days' },
      trialTitle: 'Your free trial ends tomorrow',
      trial: 'You won’t be charged if you cancel today.'
    }
  },
  template: {
    title: 'Template',
    lead: '{days} days until your salary.',
    note: 'This page shows how a page is put together.'
  },
  welcome: {
    title: 'Welcome',
    hello: 'Hi! I’m Tawazon.',
    heading: 'Know what you can spend today',
    promise: 'Tell us your salary and fixed payments. We’ll show you what you can spend each day.',
    example: 'For example',
    trustTitle: 'Simple and safe',
    trust: { bank: 'No bank login needed', time: 'Takes just 1 minute', private: 'Your data stays private' },
    start: 'Let’s start',
    haveAccount: 'I already have an account'
  },
  explore: {
    title: 'Explorer',
    subtitle: 'Design prototype · English and Arabic',
    tabs: { overview: 'Overview', screens: 'Screens', review: 'Review', label: 'Explorer sections' },
    theme: 'Light or dark',
    hero: {
      eyebrow: 'The whole app in one number',
      today: 'You can spend today',
      how: 'Salary {salary}, minus {setAside} set aside for fixed payments, leaves {use}. Shared over {days}, that\'s {daily} a day.',
      try: 'Try the app',
      browse: 'See all screens'
    },
    inside: {
      title: 'What\'s inside',
      screens: 'Screens',
      states: 'Screen states',
      languages: 'Languages',
      texts: 'Texts in each language',
      sizes: 'Text sizes',
      themes: 'Themes: light and dark'
    },
    journey: {
      title: 'The user\'s journey',
      lead: 'Tap a step to see its screens.',
      count: { one: '{n} screen', other: '{n} screens' }
    },
    person: {
      title: 'The sample person',
      lead: 'Every screen tells the same story, so the numbers always match.',
      salary: 'Salary, paid on day {day}',
      split: 'Where the salary goes',
      use: 'Money I can use',
      daily: '{amount} a day for {days}',
      debt: 'Car loan paid off in {date}',
      owed: '{name} owes {amount}',
      goal: '{name}: save about {amount} a month'
    },
    progress: {
      title: 'Review progress',
      count: '{done} of {total} approved',
      none: 'Nothing approved yet. Open a screen and tap Approve.',
      some: 'Nice progress. Each screen needs a tick in both languages.',
      all: 'Everything is approved. Ready to build.',
      go: 'Continue the review'
    },
    decisions: {
      title: 'Decisions behind the design',
      daily: { t: 'One number a day', d: 'Money I can use, shared over the days until salary. It never drops below 0.' },
      check: {
        t: 'No expense tracking',
        d: 'A quick, optional "Update my money" keeps the number right. No logging every purchase.'
      },
      status: {
        t: 'Kind status, no alarms',
        d: 'Looking good, Go easy today or A tight day. Always a face and a word, never color alone.'
      },
      changes: {
        t: 'What moves the number',
        d: 'Savings, extra debt payments and money received change it. Paying a planned bill does not.'
      },
      debts: { t: 'No double counting', d: 'Debt payments live only in Money I owe, not in fixed payments too.' },
      yearly: { t: 'Yearly payments', d: 'Spread over 12 months automatically.' },
      free: {
        t: 'Free forever',
        d: 'The daily number, how it\'s calculated, My money and Ask cards. Smart answers and export are paid, after a free 3-day trial.'
      },
      prices: {
        t: 'Honest prices',
        d: '99 SAR a year or 29 SAR a month. The amount you pay is always the biggest price on screen.'
      },
      words: { t: 'Plain words', d: 'Short sentences a first-time user understands, in both languages.' },
      ai: { t: 'AI helps, rules count', d: 'The daily number always comes from exact rules. AI only explains and suggests a plan, and the app works fully without it.' },
      over: { t: 'Overspending is okay', d: 'Spent more than planned? Choose: spread it over the days left, cover it from savings, or ask for a plan.' }
    },
    screens: {
      all: 'All',
      filter: 'Show screens from',
      states: { one: '{n} state', other: '{n} states' },
      view: 'View {name}'
    },
    viewer: {
      label: 'Screen viewer',
      close: 'Close',
      prev: 'Previous screen',
      next: 'Next screen',
      position: '{n} of {total}',
      openLive: 'Try this screen live',
      approve: 'Approve ({lang})',
      approved: 'Approved ({lang})',
      states: 'States of this screen',
      hint: 'Swipe or use the arrows to move between screens.',
      shot: 'Picture of the {name} screen: {state}',
      shotPlain: 'Picture of the {name} screen'
    },
    review: {
      title: 'Review checklist',
      lead: 'Tick each screen once you approve it in each language. Ticks stay in this browser only.',
      open: 'Open',
      clear: 'Clear all ticks',
      cleared: 'All ticks cleared.',
      approveIn: '{name} · {lang}'
    },
    foot: {
      designSystem: 'Design system',
      reset: 'Reset sample data',
      resetDone: 'Sample data is back to the start.',
      note: 'A design prototype. Numbers are examples. The real calculation comes later.'
    }
  },
  remind: {
    btn: 'Remind on WhatsApp',
    btnAria: 'Remind on WhatsApp: {name}',
    title: 'Remind {name} kindly',
    lead: 'Pick how it sounds. You can change any word.',
    toneLabel: 'How should it sound?',
    friendly: 'Friendly',
    gentle: 'Gentle',
    writeIn: 'Write in English',
    label: 'Your message',
    open: 'Open WhatsApp',
    choose: 'You\'ll pick {name} inside WhatsApp.',
    copy: 'Copy message',
    copied: 'Message copied',
    copyManual: 'We selected the message. Press and hold it to copy.',
    ready: 'Reminder ready in WhatsApp',
    cur: 'SAR',
    msg: {
      friendly: 'Hi {name} 👋 Just a small reminder about the {amount}. No rush, whenever it’s easy for you. Thank you!',
      gentle: 'Assalamu alaikum {name}, I hope you and your family are well 🌷 Sorry to bother you, just a gentle reminder about the {amount} from {date}. Whenever it suits you. Thank you, and may God reward you.'
    }
  },
  seasons: {
    title: 'Big months',
    intro: 'Some months cost more. Put a little aside each month, and they\'ll feel easy.',
    name: {
      ramadan: 'Ramadan',
      eidFitr: 'Eid al-Fitr',
      eidAdha: 'Eid al-Adha',
      summer: 'Summer holiday',
      school: 'Back to school'
    },
    covers: {
      ramadan: 'Food, gatherings and giving',
      eidFitr: 'New clothes, Eidiya and visits',
      eidAdha: 'The sacrifice, family and visits',
      summer: 'Travel and days out',
      school: 'Bags, books and uniforms'
    },
    sum: {
      label: 'Set aside for big months',
      daily: 'Your daily number',
      was: 'Without it, it would be {amount}. A little less each day, and no shock when the month comes.',
      forLabel: 'Saving for'
    },
    empty: {
      title: 'Nothing set aside yet',
      text: 'Pick a month below. We\'ll work out a small amount to set aside each month.',
      daily: 'Your daily number stays {amount}.'
    },
    listTitle: 'Coming up',
    moonNote: 'Ramadan and the two Eids follow the moon, so their dates can move by a day or two.',
    when: { one: 'In about a month', other: 'In about {n} months' },
    whenDays: 'In {days}',
    cost: 'Usually costs',
    change: 'Change',
    changeAria: 'Change the amount for {name}',
    perMonth: 'Save about {amount} a month',
    start: 'Start saving for it',
    saving: 'Saving for it',
    keepNote: 'We set this money aside, like a fixed payment. When the month comes, it\'s ready.',
    editTitle: 'How much does {name} usually cost?',
    amountLabel: 'Usual cost',
    preview: 'Your daily number: {from} → {to}',
    toastOn: 'Now saving for {name}. Your daily number: {from} → {to}',
    toastOff: 'Stopped saving for {name}. Your daily number: {from} → {to}',
    toastAmount: 'New amount for {name}. Your daily number: {from} → {to}',
    toastAmountOff: 'New amount for {name}. That\'s about {amount} a month.',
    undone: 'Back as it was.',
    demo: { plan: 'Planning (nothing on)', saving: 'Saving for Ramadan and Eid' }
  },
  speak: {
    read: 'Read aloud',
    noVoice: 'Your phone has no English voice yet. You can add one in your phone settings.',
    noSpeech: 'This phone can’t read aloud yet. You can turn it on in your phone settings.',
    cur: 'riyals',
    home: 'You can spend {amount} today. {status}. {days}',
    days: { one: 'One day until your salary.', other: '{n} days until your salary.' }
  },
  widget: {
    homeAria: 'Example: Tawazon on your phone’s home screen',
    today: 'Today',
    daysLeft: { one: '1 day until salary', other: '{n} days until salary' },
    next: '{name} {amount} · {date}',
    nextAria: 'Next payment',
    addTitle: 'Add Tawazon to your home screen',
    addLead: 'See your daily number without opening the app.',
    step1: 'Press and hold an empty spot on your home screen.',
    step2: 'Tap the + button at the top.',
    step3: 'Choose Tawazon, pick a size, then tap Add.'
  }
};

/* ==== page: homeMonth ==== */
TZ.LANGS.en.home.monthLink = { title: 'My month', sub: 'Your number, payments and savings in simple charts' };
/* ==== end: homeMonth ==== */

/* ==== page: month ==== */
/* My month — English strings (merged into en.js later by tools/merge-lang.js) */
TZ.LANGS.en.month = {
  title: 'My month',
  lead: 'Your month from salary to salary, at a glance.',
  hero: {
    day: 'Day {day} of {total}',
    daysLeft: { one: '{n} day until salary', other: '{n} days until salary' }
  },
  daily: {
    title: 'Your daily number this month',
    sub: 'From salary day ({date}) to today',
    readout: '{date}: {amount}',
    readoutToday: 'Today: {amount}',
    scrub: 'Pick a day to see its number',
    aria: 'Your daily number from {start} to today. It started at {first}. The highest was {high} and the lowest was {low}. Today it is {today}. A normal day is {normal}.',
    today: 'Today',
    salary: 'Salary {date}',
    normal: 'A normal day: {amount}',
    legend: { number: 'Your daily number', normal: 'A normal day', ahead: 'If nothing changes' },
    highest: 'Highest',
    lowest: 'Lowest',
    onDate: 'on {date}',
    up: 'Up on {date}: {why}',
    down: 'Down on {date}: {why}',
    flat: 'Your number stayed steady this month.',
    why: {
      received: '{name} paid you back {amount}.',
      savings: 'you added {amount} to savings.',
      other: 'from {from} to {to}.'
    }
  },
  split: {
    title: 'Where your salary goes',
    total: 'Salary {amount}',
    seasons: 'Big months',
    pct: '{n}%',
    aria: 'Your salary of {salary}: {list}.'
  },
  cal: {
    title: 'The days until salary',
    hint: 'Tap a marked day to see what happens.',
    aria: 'Calendar from {from} to {to}',
    dayAria: '{date}: {what}',
    salary: 'Salary',
    payment: '{date}: {name}, {amount}. It’s already set aside, so your number stays the same.',
    paid: '{date}: {name}, {amount}. Already paid.',
    salaryDetail: '{date}: your salary of {amount} arrives. A new month starts.'
  },
  saved: {
    title: 'Saved month by month',
    sub: { one: 'The last month', other: 'The last {n} months' },
    leftOver: 'Left over',
    saved: 'Saved',
    total: 'Savings so far',
    item: '{month}: {left} left over, {saved} saved',
    aria: 'Left over and saved, month by month. {list}. Savings so far: {total}.'
  },
  note: 'Tawazon does not track every purchase. These charts come from your salary, your payments and the times you update your money.'
};
TZ.LANGS.en.gallery.screen.month = {
  name: 'My month',
  desc: 'Your month in pictures: your daily number, where your salary goes, the days until salary and what you saved.'
};
/* ==== end: month ==== */

/* ==== page: overspend ==== */
/* Spent more than planned · ran out before salary · a plan from Tawazon (assets/js/overspend.js) */
TZ.LANGS.en.overspend = {
  nothingLeft: 'I have no money left',
  title: 'You spent {amount} more than planned',
  sub: 'That’s okay. Let’s choose what feels right.',
  legend: 'What would you like to do?',
  recommended: 'Recommended',
  perDay: '{amount} a day',
  spread: {
    title: 'Spread it over {days}',
    sub: 'Until your salary on {date}',
    btn: 'Spread it out'
  },
  savings: {
    title: 'Cover it from savings',
    titlePart: 'Cover part from savings',
    stay: 'Stay at {amount} a day',
    after: 'Savings {from} → {to}',
    part: 'Savings cover {amount} of it',
    btn: 'Use my savings'
  },
  ask: {
    title: 'Ask Tawazon for a plan',
    sub: 'A short plan with your numbers',
    btn: 'Ask Tawazon'
  },
  toastSame: 'Done. {amount} came from savings. Your daily number stays {to} SAR.',
  toastSavings: 'Done. {amount} came from savings. Your daily number: {from} → {to} SAR',
  ranout: {
    title: 'Let’s get you to salary day',
    sub: 'It happens. Here’s what can help, with your real numbers.',
    zero: 'Your number shows 0 for now. It never goes below zero.',
    help: 'What can help',
    savingsTitle: 'Use your savings',
    savingsSub: 'You have {amount} saved',
    owedTitle: '{name} owes you {amount}',
    owedSub: 'Send a kind reminder',
    moveTitle: 'Ask to move the {name}',
    moveSub: '{amount} on {date}',
    askTitle: 'Ask Tawazon for a plan',
    askSub: 'Three small steps, with your numbers',
    then: 'Then {amount} a day',
    back: 'Back to Home'
  },
  plan: {
    intro: 'Here’s a simple plan until your salary on {date}:',
    newNumber: 'Your new number is {daily} a day. That spreads the extra {extra} over {days}.',
    steady: 'Your number is {daily} a day until your salary.',
    update: 'Your number is {daily} a day. Spent more? Tap “Update my money” on Home, and I’ll work it out again.',
    zero: 'Your number is 0 for now. Your salary comes in {days}.',
    owed: '{name} owes you {amount}. If it comes back, you’re at {daily} a day.',
    savings: 'Your savings ({amount}) can help. Using them gives you {daily} a day.',
    move: 'You could ask to move the {name} ({amount}). Then you’d have {daily} a day.',
    payment: 'Biggest payment before salary: {name}, {amount} on {date}. It’s already set aside.',
    outro: 'Small steps. You’ve got this.'
  }
};

TZ.LANGS.en.home.demo = Object.assign(TZ.LANGS.en.home.demo, {
  over: 'Spent more than planned',
  ranout: 'Ran out before salary'
});

TZ.LANGS.en.ask.q = Object.assign(TZ.LANGS.en.ask.q, {
  over: 'I spent more than my number',
  overSub: 'A simple plan to salary day'
});
TZ.LANGS.en.ask.why = Object.assign(TZ.LANGS.en.ask.why, {
  check: 'You updated your money',
  fromSavings: 'You used {amount} from savings'
});
TZ.LANGS.en.ask.demo = Object.assign(TZ.LANGS.en.ask.demo, {
  plan: 'Plan after spending more'
});
/* ==== end: overspend ==== */
