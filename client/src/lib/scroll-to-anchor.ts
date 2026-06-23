export function scrollToAnchor(hash: `#${string}`, behavior: ScrollBehavior = 'smooth'): boolean {
  const id = hash.slice(1);

  if (!id) {
    return false;
  }

  const target = document.getElementById(id);

  if (!target) {
    return false;
  }

  const header = document.querySelector('header');
  const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({ top: Math.max(targetTop - headerHeight, 0), behavior });
  return true;
}
