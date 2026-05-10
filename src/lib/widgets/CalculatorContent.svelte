<script lang="ts">
  import { AMBIENT_TEMPERATURE } from "$lib/index"

  let {
    measuredResults = [],
  }: { measuredResults?: { reaction: string; measuredTempC: number }[] } = $props()

  let Vacid1 = $state(25)
  let Tfinal1 = $state(0)
  let Tinitial1 = $state(AMBIENT_TEMPERATURE)
  let Vacid2 = $state(25)
  let Tfinal2 = $state(0)
  let Tinitial2 = $state(AMBIENT_TEMPERATURE)
  let Vacid3 = $state(25)
  let Tfinal3 = $state(0)
  let Tinitial3 = $state(AMBIENT_TEMPERATURE)

  $effect(() => {
    const hclNaoh = measuredResults.find((result) => result.reaction === "HCl + NaOH")
    const h2so4Naoh = measuredResults.find((result) => result.reaction === "H2SO4 + NaOH")
    const hclNh4oh = measuredResults.find((result) => result.reaction === "HCl + NH4OH")

    if (hclNaoh) Tfinal1 = hclNaoh.measuredTempC
    if (h2so4Naoh) Tfinal2 = h2so4Naoh.measuredTempC
    if (hclNh4oh) Tfinal3 = hclNh4oh.measuredTempC
  })
</script>

<h1><strong>Calcule și rezultate</strong></h1>
<p><strong>Date cunoscute:</strong></p>

<details>
  <summary><strong>Calorimetrul</strong></summary>
  <div class="initial_values">
    <div>C<sub>calorimetru</sub> = 20 calorii/grad, unde:</div>
  </div>
  <div class="secondary_values">
    <div>m<sub>calorimetru</sub> este masa calorimetrului</div>
    <div>c<sub>calorimetru</sub> este capacitatea calorică a acestuia</div>
    <div>
      iar m<sub>calorimetru</sub> &middot; c<sub>calorimetru</sub> reprezintă
      C<sub>calorimetru</sub>, adică capacitatea calorică a calorimetrului
    </div>
  </div>
</details>

<details>
  <summary><strong>Soluțiile acide</strong></summary>
  <div class="initial_values">
    <div>
      m<sub>soluție acidă</sub> = V<sub>soluție acidă</sub> &middot;
      &rho;<sub>soluție acidă</sub> , unde:
    </div>
  </div>
  <div class="secondary_values">
    <div>m<sub>soluție acidă</sub> este masa soluției acide</div>
    <div>V<sub>soluție acidă</sub> este volumul soluției acide</div>
    <div>
      &rho;<sub>soluție acidă</sub> este densitatea acesteia și are valoarea 1.06
      g/cm<sup>3</sup>
    </div>
  </div>
  <div class="secondary_values">
    <div>c<sub>soluție acidă</sub> = 0.931 calorii/g &middot; grad</div>
  </div>
</details>

<details>
  <summary><strong>Soluțiile bazice</strong></summary>
  <div class="initial_values">
    <div>
      m<sub>soluție bazică</sub> = V<sub>soluție bazică</sub> &middot;
      &rho;<sub>soluție bazică</sub> , unde:
    </div>
  </div>
  <div class="secondary_values">
    <div>m<sub>soluție bazică</sub> este masa soluției bazice</div>
    <div>
      V<sub>soluție bazică</sub> este volumul soluției bazice și este de 2 ori mai
      mare decât cel al soluției acide
    </div>
    <div>
      &rho;<sub>soluție bazică</sub> este densitatea acesteia și are valoarea 1.06
      g/cm<sup>3</sup>
    </div>
  </div>
  <div class="secondary_values">
    <div>c<sub>soluție bazică</sub> = 0.931 calorii/g &middot; grad</div>
  </div>
</details>

<details>
  <summary><strong>Numărul de echivalenți</strong></summary>
  <div class="initial_values">
    <div>n = V<sub>soluție acidă</sub> &middot; N<sub>soluție acidă</sub> / 1000 , sau</div>
    <div>n = V<sub>soluție bazică</sub> &middot; N<sub>soluție bazică</sub> / 1000 , unde:</div>
  </div>
  <div class="secondary_values">
    <div>n este numărul de echivalenți de acid sau bază</div>
    <div>V<sub>soluție acidă</sub> este volumul soluției acide</div>
    <div>N<sub>soluție acidă</sub> este normalitatea acidului</div>
    <div>V<sub>soluție bazică</sub> este volumul soluției bazice</div>
    <div>N<sub>soluție bazică</sub> este normalitatea bazei</div>
  </div>
</details>

<details>
  <summary><strong>Temperatura inițială și finală</strong></summary>
  <div class="initial_values">
    <div>
      t<sub>inițială</sub> = {AMBIENT_TEMPERATURE}&deg;C și reprezintă temperatura inițială a soluțiilor
    </div>
    <div>t<sub>finală</sub> = temperatura măsurată după amestecarea soluțiilor</div>
  </div>
</details>

<div>
  <table>
    <thead>
      <tr>
        <th>Reacția studiată</th>
        <th>V<sub>soluție acidă</sub><br />(mL)</th>
        <th>t<sub>inițială</sub><br />(&deg;C)</th>
        <th>t<sub>finală</sub><br />(&deg;C)</th>
        <th class="has-tooltip">
          &Delta;t<br />(&deg;C)
          <div class="tooltip">
            <strong>Variația de temperatură:</strong><br />
            &Delta;t = t<sub>finală</sub> - t<sub>inițială</sub>
          </div>
        </th>
        <th class="has-tooltip">
          Q<br />(cal)
          <div class="tooltip">
            <strong>Căldura transferată:</strong><br />
            Q = (C<sub>calorimetru</sub> + m<sub>soluție acidă</sub> &middot;
            c<sub>soluție acidă</sub> + m<sub>soluție bazică</sub> &middot; c<sub>soluție bazică</sub>)
            &middot; &Delta;t<br />
          </div>
        </th>
        <th class="has-tooltip">
          &Delta;H<br />(cal/echiv)
          <div class="tooltip">
            <strong>Entalpia de neutralizare:</strong><br />
            &Delta;H = -Q / n<br />
            <small>n = (V<sub>acid</sub> &middot; N<sub>acid</sub>) / 1000 sau</small><br />
            <small>n = (V<sub>bază</sub> &middot; N<sub>bază</sub>) / 1000</small><br />
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>HCl + NaOH &rarr; NaCl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid1} /></td>
        <td><input type="number" bind:value={Tinitial1} /></td>
        <td><input type="number" bind:value={Tfinal1} /></td>
        <td>{Tfinal1 - Tinitial1}</td>
        <td>{((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - Tinitial1)).toFixed(3)}</td>
        <td>{(-1 * ((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - Tinitial1)) / (Vacid1 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>H<sub>2</sub>SO<sub>4</sub> + 2NaOH &rarr; Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid2} /></td>
        <td><input type="number" bind:value={Tinitial2} /></td>
        <td><input type="number" bind:value={Tfinal2} /></td>
        <td>{Tfinal2 - Tinitial2}</td>
        <td>{((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - Tinitial2)).toFixed(3)}</td>
        <td>{(-1 * ((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - Tinitial2)) / (Vacid2 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>HCl + NH<sub>4</sub>OH &rarr; NH<sub>4</sub>Cl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid3} /></td>
        <td><input type="number" bind:value={Tinitial3} /></td>
        <td><input type="number" bind:value={Tfinal3} /></td>
        <td>{Tfinal3 - Tinitial3}</td>
        <td>{((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - Tinitial3)).toFixed(3)}</td>
        <td>{(-1 * ((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - Tinitial3)) / (Vacid3 / 1000)).toFixed(3)}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  details {
    margin-bottom: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #fafafa;
    overflow: hidden;
  }
  summary {
    padding: 12px 15px;
    font-weight: bold;
    cursor: pointer;
    background-color: #f1f3f5;
    list-style: none;
    display: flex;
    align-items: center;
  }
  details[open] summary {
    background-color: #07e576;
    border-bottom: 1px solid #ddd;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
    background-color: white;
  }

  th,
  td {
    border: 0.05rem solid black;
    padding: 0.5rem;
    text-align: center;
  }
  th {
    background-color: #f2f2f2;
  }
  .has-tooltip {
    position: relative;
    cursor: help;
    text-decoration: underline dotted #666;
  }
  .tooltip {
    visibility: hidden;
    background-color: #2c3e50;
    color: #ecf0f1;
    text-align: left;
    padding: 12px;
    border-radius: 6px;
    position: absolute;
    z-index: 10;
    bottom: 125%;
    right: 0%;
    opacity: 0;
    transition: opacity 0.3s, visibility 0.3s;
    width: max-content;
    max-width: 1000px;
    font-weight: normal;
    font-size: 0.9rem;
    line-height: 1.4;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    right: 10%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #2c3e50 transparent transparent transparent;
  }
  .has-tooltip:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .initial_values {
    padding-left: 2rem;
  }
  .secondary_values {
    font-size: 0.95em;
    padding-left: 4rem;
  }
</style>
