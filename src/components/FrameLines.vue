<template>
  <div aria-hidden="true" class="frame-lines hidden sm:block">
    <span
      class="crosshair-mark absolute top-14 -translate-x-1/2 -translate-y-1/2"
      style="left: calc((100% - min(100% - var(--frame-x) * 2, 80rem)) / 2)"
    />
    <span
      class="crosshair-mark absolute top-14 translate-x-1/2 -translate-y-1/2"
      style="right: calc((100% - min(100% - var(--frame-x) * 2, 80rem)) / 2)"
    />
    <span
      class="crosshair-mark absolute bottom-10 -translate-x-1/2 translate-y-1/2"
      style="left: calc((100% - min(100% - var(--frame-x) * 2, 80rem)) / 2)"
    />
    <span
      class="crosshair-mark absolute bottom-10 translate-x-1/2 translate-y-1/2"
      style="right: calc((100% - min(100% - var(--frame-x) * 2, 80rem)) / 2)"
    />
  </div>
</template>
