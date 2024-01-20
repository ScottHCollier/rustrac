<script lang="ts">
  import agent from "../api/agent";
  import { token } from "../store/auth";

  async function login(){
    const res = await agent.Routes.login({
      client_id: 'foo',
      client_secret: 'bar',
    });
    token.set(res.access_token);
  }
</script>

<button on:click={login}>
  login
</button>
