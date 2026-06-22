// src/modules/salary-role-page.js

const SALARY_API = 'https://salarycalculator.somewheretypingtest.com/api/caller/embedded-table?mode=flat';

async function initRolePageSalary() {
  if (!document.getElementById('roles-slider')) return;

  const slideLinks = document.querySelectorAll('[data-role-api-key]');
  if (!slideLinks.length) return;

  const res = await fetch(SALARY_API);
  const roles = await res.json();

  const parse = v => parseInt(v.replace(/\D/g, ''), 10);

  slideLinks.forEach(link => {
    const roleName = link.getAttribute('data-role-api-key').trim();
    if (!roleName) return;

    const match = roles.find(r => r.role === roleName);
    if (!match) return;

    const startingAt = Math.min(parse(match.juniorPh), parse(match.juniorSa), parse(match.juniorLatinAmerica));
    const upTo = Math.max(parse(match.seniorPh), parse(match.seniorSa), parse(match.seniorLatinAmerica));
    const savingsPercentage = Math.round(((upTo - startingAt) / upTo) * 100);

    const map = {
      'starting-at':                  `$${startingAt.toLocaleString()}`,
      'up-to':                        `$${upTo.toLocaleString()}`,
      'savings-percentage':           `${savingsPercentage}%`,
      'south-africa-starting-salary': match.juniorSa,
      'philippines-starting-salary':  match.juniorPh,
      'latam-starting-salary':        match.juniorLatinAmerica,
    };

    link.querySelectorAll('[data-salary]').forEach(el => {
      if (map[el.dataset.salary] !== undefined) el.textContent = map[el.dataset.salary];
    });
  });
}

initRolePageSalary();