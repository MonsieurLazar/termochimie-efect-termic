<script lang="ts">
  let Vacid1 = $state(25)
  let Tfinal1 = $state(0)
  let Tinitial1 = $state(25)
  let Vacid2 = $state(25)
  let Tfinal2 = $state(0)
  let Tinitial2 = $state(25)
  let Vacid3 = $state(25)
  let Tfinal3 = $state(0)
  let Tinitial3 = $state(25)
</script>

<h1><strong>Calcule si rezultate</strong></h1>
<p><strong>Date cunoscute:</strong></p>

<details>
  <summary><strong>Calorimetrul</strong></summary>
  <div class="initial_values">
    <div>C<sub>calorimetru</sub> = 20 calorii/grade, unde:</div>
  </div>
  <div class="secondary_values">
    <div>m<sub>calorimetru</sub> este masa calorimetrului</div>
    <div>c<sub>calorimetru</sub> este capacitatea calorica a acestuia</div>
    <div>
      iar m<sub>calorimetru</sub> * c<sub>calorimetru</sub> reprezinta
      C<sub>calorimetru</sub>, adica capacitatea calorica a calorimetrului
    </div>
  </div>
</details>

<details>
  <summary><strong>Solutiile acide</strong></summary>
  <div class="initial_values">
    <div>
      m<sub>solutieacida</sub> = V<sub>solutieacida</sub> *
      &rho;<sub>solutieacida</sub> , unde:
    </div>
  </div>
  <div class="secondary_values">
    <div>m<sub>solutieacida</sub> este masa solutiei acide</div>
    <div>V<sub>solutieacida</sub> este volumul solutiei acide</div>
    <div>
      &rho;<sub>solutieacida</sub> este densitatea acesteia si are valoarea 1.06
      grame/cm<sup>3</sup>
    </div>
  </div>
  <div class="secondary_values">
    <div>c<sub>solutieacida</sub> = 0.931 calorii/grame * grad</div>
  </div>
</details>

<details>
  <summary><strong>Solutiile bazice</strong></summary>
  <div class="initial_values">
    <div>
      m<sub>solutiebazica</sub> = V<sub>solutiebazica</sub> *
      &rho;<sub>solutiebazica</sub> , unde:
    </div>
  </div>
  <div class="secondary_values">
    <div>m<sub>solutiebazica</sub> este masa solutiei bazice</div>
    <div>
      V<sub>solutiebazica</sub> este volumul solutiei bazice si este de 2 ori mai
      mare decat cel al solutiei acide
    </div>
    <div>
      &rho;<sub>solutiebazica</sub> este densitatea acesteia si are valoarea 1.06
      grame/cm<sup>3</sup>
    </div>
  </div>
  <div class="secondary_values">
    <div>c<sub>solutiebazica</sub> = 0.931 calorii/grame * grad</div>
  </div>
</details>

<details>
  <summary><strong>Numarul de echivalenti</strong></summary>
  <div class="initial_values">
    <div>n = V<sub>solutieacida</sub> * N<sub>solutieacida</sub> / 1000 , sau</div>
    <div>n = V<sub>solutiebazica</sub> * N<sub>solutiebazica</sub> / 1000 , unde:</div>
  </div>
  <div class="secondary_values">
    <div>n este numarul de echivalenti de acid sau baza</div>
    <div>V<sub>solutieacida</sub> este volumul solutiei acide</div>
    <div>N<sub>solutieacida</sub> este normalitatea acidului</div>
    <div>V<sub>solutiebazica</sub> este volumul solutiei bazice</div>
    <div>N<sub>solutiebazica</sub> este normalitatea bazei</div>
  </div>
</details>

<details>
  <summary><strong>Temperatura initiala si finala</strong></summary>
  <div class="initial_values">
    <div>
      t<sub>initiala</sub> = 25 C si reprezinta temperatura initiala a solutiilor
    </div>
    <div>t<sub>finala</sub> = temperatura masurata dupa amestecarea solutiilor</div>
  </div>
</details>

<div>
  <table>
    <thead>
      <tr>
        <th>Reactia studiata</th>
        <th>V<sub>solutieacida</sub><br />(mL)</th>
        <th>t<sub>initiala</sub><br />(C)</th>
        <th>t<sub>finala</sub><br />(C)</th>
        <th class="has-tooltip">
          &Delta;t<br />(C)
          <div class="tooltip">
            <strong>Variatia de temperatura:</strong><br />
            &Delta;t = t<sub>finala</sub> - t<sub>initiala</sub>
          </div>
        </th>
        <th class="has-tooltip">
          Q<br />(cal)
          <div class="tooltip">
            <strong>Caldura transferata:</strong><br />
            Q = (C<sub>calorimetru</sub> + m<sub>solutieacida</sub> *
            c<sub>solutieacida</sub> + m<sub>solutiebazica</sub>*c<sub>solutiebazica</sub>)
            * &Delta;t<br />
          </div>
        </th>
        <th class="has-tooltip">
          &Delta;H<br />(cal/echiv)
          <div class="tooltip">
            <strong>Entalpia de neutralizare:</strong><br />
            &Delta;H = -Q / n<br />
            <small>n = (V<sub>acid</sub> * N<sub>acid</sub>) / 1000 sau</small><br />
            <small>n = (V<sub>baza</sub> * N<sub>baza</sub>) / 1000</small><br />
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
