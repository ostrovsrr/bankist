'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-01-16T13:15:33.035Z',
    '2020-02-30T09:48:16.867Z',
    '2020-05-25T06:04:23.907Z',
    '2020-12-25T14:18:46.235Z',
    '2023-08-11T16:33:06.386Z',
    '2023-08-15T14:43:26.374Z',
    '2023-08-16T18:49:59.371Z',
    '2023-08-17T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'ru-Ru',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-04-01T13:15:33.035Z',
    '2023-02-30T09:48:16.867Z',
    '2021-05-25T06:04:23.907Z',
    '2020-12-25T14:18:46.235Z',
    '2023-01-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2022-11-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const calcDisplayDate = function (date, locale = 'en-US') {
  const daysBetween = (date1, date2) =>
    Math.floor(Math.abs((+date1 - +date2) / (1000 * 60 * 60 * 24)));
  const dif = daysBetween(new Date(), date);
  if (dif === 0) {
    return 'Today';
  }
  if (dif === 1) {
    return 'yesterday';
  }
  if (dif <= 7) {
    return `${dif} days ago`;
  }
  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  let movs = acc.movements.slice();
  let dates = acc.movementsDates.slice();
  // Implementation of sorting dates and movements
  if (sort) {
    let combined = movs.map((value, index) => [value, dates[index]]);
    combined.sort((a, b) => a[0] - b[0]);
    combined.forEach((el, index) => {
      movs[index] = el[0];
      dates[index] = el[1];
    });
  }
  movs.forEach(function (mov, i) {
    const date = new Date(dates[i]);
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${calcDisplayDate(date, acc.locale)}</div>
        <div class="movements__value">${formatBalance(mov, acc.locale)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const options1 = {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

const formatBalance = (balance, locale) => {
  const options = {
    style: 'currency',
    currency: 'EUR',
  };
  return new Intl.NumberFormat(locale, options).format(balance);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatBalance(acc.balance, acc.locale)}`;
  const date = new Date();

  labelDate.textContent = new Intl.DateTimeFormat(acc.locale, options1).format(
    date
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatBalance(incomes, acc.locale)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatBalance(Math.abs(out), acc.locale)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatBalance(interest, acc.locale)}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
const timerLogout = function () {
  let time = 300;
  const tick = () => {
    let min = Math.trunc(time / 60);
    let sec = time % 60;
    labelTimer.textContent = `${min.toString().padStart(2, 0)}:${sec
      .toString()
      .padStart(2, 0)}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) {
      clearInterval(timer);
    }
    timer = timerLogout();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    const date = new Date().toISOString();
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(date);
    receiverAcc.movementsDates.push(date);

    clearInterval(timer);
    timer = timerLogout();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  setTimeout(function () {
    if (
      amount > 0 &&
      currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
      // Add movement
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      clearInterval(timer);
      timer = timerLogout();
      // Update UI
      updateUI(currentAccount);
    }
  }, 2500);
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
