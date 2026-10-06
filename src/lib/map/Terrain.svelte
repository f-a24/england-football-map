<script lang="ts">
  import CountryPlate from './CountryPlate.svelte';

  const ENGLAND_COLOR = '#7cc576';
  const OTHER_LAND_COLOR = '#6b7378';
</script>

<CountryPlate url="/map/neighbors.json" color={OTHER_LAND_COLOR} layer={0} seamWidth={2} />
<CountryPlate url="/map/uk-context.json" color={OTHER_LAND_COLOR} layer={1} seamWidth={2} />
<CountryPlate url="/map/england.json" color={ENGLAND_COLOR} layer={2} />
