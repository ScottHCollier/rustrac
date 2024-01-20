<script lang="ts">
  import agent from "../api/agent";

  async function getPrivate(){
    await agent.Routes.getPrivate();
  }
</script>

<button on:click={getPrivate}>
  getPrivate  
</button>
