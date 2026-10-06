function createViewportState() {
  let width = $state(window.innerWidth);
  window.addEventListener('resize', () => {
    width = window.innerWidth;
  });

  return {
    get isMobile() {
      return width < 640;
    },
  };
}

export const viewport = createViewportState();
