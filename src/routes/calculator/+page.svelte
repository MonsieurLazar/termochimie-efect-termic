<script lang="ts">
    let Vacid1 = $state(25);
    let Tfinal1 = $state(0);
    let Vacid2 = $state(25);
    let Tfinal2 = $state(0);
    let Vacid3 = $state(25);
    let Tfinal3 = $state(0);
</script>

<h1><strong>Calcule si rezultate</strong></h1>
<p>Conform ecuației calorimetrice:</p>
<div>
    <span class = "formula">
        Q = (m<sub>calorimetru</sub> * c<sub>calorimetru</sub> + m<sub>soluțieacidă</sub> * c<sub>acid</sub> + m<sub>soluțiebazică</sub> * c<sub>bază</sub>) * (t<sub>finală</sub>-t<sub>initială</sub>)
    </span>
    <span>
        , in care se cunosc:
    </span>
</div>
<div class = "initial_values">
    <div>m<sub>calorimetru</sub> * c<sub>calorimetru</sub> = 20 calorii/grade, unde:</div>
</div>
<div class = "secondary_values">
    <div>m<sub>calorimetru</sub> este masa calorimetrului</div>
    <div>c<sub>calorimetru</sub> este capacitatea calorică a acestuia</div>
    <div>iar m<sub>calorimetru</sub> * c<sub>calorimetru</sub> reprezintă C<sub>calorimetru</sub>, adică capacitatea calorică a calorimetrului</div>
</div>
<div class = "initial_values">
    <div>m<sub>soluțieacidă</sub> = V<sub>soluțieacidă</sub> * &rho;<sub>soluțieacidă</sub> , unde:</div>
</div>
<div class = "secondary_values">
    <div>m<sub>soluțieacidă</sub> este masa soluției acide</div>
    <div>V<sub>soluțieacidă</sub> este volumul soluției acide</div>
    <div>&rho;<sub>soluțieacidă</sub> este densitatea acesteia și are valoarea 1.06 grame/cm<sup>3</sup></div>
</div>
<div class = "secondary_values">
    <div>c<sub>acid</sub> = 0.931 calorii/grame * grad</div>
</div>
<div class = "initial_values">
    <div>m<sub>soluțiebazică</sub> = V<sub>soluțiebazică</sub> * &rho;<sub>soluțiebazică</sub> , unde:</div>
</div>
<div class = "secondary_values">
    <div>m<sub>soluțiebazică</sub> este masa soluției bazice</div>
    <div>V<sub>soluțiebazică</sub> este volumul soluției bazice</div>
    <div>&rho;<sub>soluțiebazică</sub> este densitatea acesteia și are valoarea 1.06 grame/cm<sup>3</sup></div>
</div>
<div class = "secondary_values">
    <div>c<sub>bază</sub> = 0.931 calorii/grame * grad</div>
</div>
<div>
    <span class = "formula">
        &Delta;H = -Q/n            
    </span>
    <span>
        , unde H este entalpia, si in care se cunosc:
    </span>
</div>
<div class = "initial_values">
    <div>n = V<sub>soluțieacidă</sub> * N<sub>soluțieacidă</sub> / 1000 , sau</div>
    <div>n = V<sub>soluțiebazică</sub> * N<sub>soluțiebazică</sub> / 1000 , unde:</div>
</div>
<div class = "secondary_values">
    <div>n este numărul de echivalenți de acid sau bază</div>
    <div>V<sub>soluțieacidă</sub> este volumul soluției acide</div>
    <div>N<sub>soluțieacidă</sub> este normalitatea acidului</div>
    <div>V<sub>soluțiebazică</sub> este volumul soluției bazice</div>
    <div>N<sub>soluțiebazică</sub> este normalitatea bazei</div>
</div>
<div class = "initial_values">
    <div>Q este căldura transferată, calculată cu formula de mai sus</div>
</div>

<div>
  <table>
    <thead>
      <tr>
        <th>Reacția studiată</th>
        <th>V<sub>soluțieacidă</sub><br />(mL)</th>
        <th>t<sub>inițială</sub><br />(°C)</th>
        <th>t<sub>finală</sub><br />(°C)</th>
        <th>&Delta;t<br />(°C)</th>
        <th>Q<br />(cal)</th>
        <th>&Delta;H<br />(cal/echiv)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>HCl + NaOH &rarr; NaCl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid1} /></td><td>25</td><td><input type="number" bind:value={Tfinal1}/></td><td>{Tfinal1 - 25}</td><td>{((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - 25)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - 25)) / (Vacid1 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>H<sub>2</sub>SO<sub>4</sub> + 2NaOH &rarr; Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid2} /></td><td>25</td><td><input type="number" bind:value={Tfinal2}/></td><td>{Tfinal2 - 25}</td><td>{((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - 25)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - 25)) / (Vacid2 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>HCl + NH<sub>4</sub>OH &rarr; NH<sub>4</sub>Cl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid3} /></td><td>25</td><td><input type="number" bind:value={Tfinal3}/></td><td>{Tfinal3 - 25}</td><td>{((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - 25)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - 25)) / (Vacid3 / 1000)).toFixed(3)}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
    table
    {
        width: 100%;
        border-collapse: collapse; /* Aceasta elimină spațiul dublu dintre linii */
        margin-top: 2rem;
        background-color: white;
    }

    th, td
    {
        border: 0.05rem solid black; /* Aceasta trasează liniile */
        padding: 0.5rem;
        text-align: center;
    }
    th
    {
        background-color: #f2f2f2; /* Opțional: un fundal gri deschis pentru capul de tabel */
    }
    .formula
    {
        font-weight: bold;
    }
    .initial_values
    {
        padding-left: 2rem;
    }
    .secondary_values   
    {
        font-size: 0.95em;
        padding-left: 4rem;
    }
</style>