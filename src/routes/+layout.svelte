<script lang="ts">
  import "../lib/styles/global.css"

  let { children } = $props()
</script>

<div class="main">
  {@render children()}
</div>

<style>
  .main {
    padding: 1rem;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    position: relative; 
    background-color: #ffffff; 
  }

  :global(body::before) {
    content:"";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-image: url('/design/background/background_1920_1200.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    image-rendering: pixelated;

    opacity: 20%;

    pointer-events: none;
  }
</style>
