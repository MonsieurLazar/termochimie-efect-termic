<script lang="ts">
    let Vacid1 = $state(25);
    let Tfinal1 = $state(0);
    let Tinițial1 = $state(25);
    let Vacid2 = $state(25);
    let Tfinal2 = $state(0);
    let Tinițial2 = $state(25);
    let Vacid3 = $state(25);
    let Tfinal3 = $state(0);
    let Tinițial3 = $state(25);
</script>

<h1><strong>Calcule si rezultate</strong></h1>
<p> <strong> Date cunoscute:</strong></p>

<details>
    <summary><strong>Calorimetrul</strong></summary>
    <div class = "initial_values">
        <div>C<sub>calorimetru</sub> = 20 calorii/grade, unde:</div>
    </div>
    <div class = "secondary_values">
        <div>m<sub>calorimetru</sub> este masa calorimetrului</div>
        <div>c<sub>calorimetru</sub> este capacitatea calorică a acestuia</div>
        <div>iar m<sub>calorimetru</sub> * c<sub>calorimetru</sub> reprezintă C<sub>calorimetru</sub>, adică capacitatea calorică a calorimetrului</div>
    </div>
</details>

<details>
    <summary><strong>Soluțiile acide</strong></summary>
    <div class = "initial_values">
        <div>m<sub>soluțieacidă</sub> = V<sub>soluțieacidă</sub> * &rho;<sub>soluțieacidă</sub> , unde:</div>
    </div>
    <div class = "secondary_values">
        <div>m<sub>soluțieacidă</sub> este masa soluției acide</div>
        <div>V<sub>soluțieacidă</sub> este volumul soluției acide</div>
        <div>&rho;<sub>soluțieacidă</sub> este densitatea acesteia și are valoarea 1.06 grame/cm<sup>3</sup></div>
    </div>
    <div class = "secondary_values">
        <div>c<sub>soluțieacidă</sub> = 0.931 calorii/grame * grad</div>
    </div>
</details>

<details>
    <summary><strong>Soluțiile bazice</strong></summary>
    <div class = "initial_values">
        <div>m<sub>soluțiebazică</sub> = V<sub>soluțiebazică</sub> * &rho;<sub>soluțiebazică</sub> , unde:</div>
    </div>
    <div class = "secondary_values">
        <div>m<sub>soluțiebazică</sub> este masa soluției bazice</div>
        <div>V<sub>soluțiebazică</sub> este volumul soluției bazice și este de 2 ori mai mare decat cel al solutiei acide</div>
        <div>&rho;<sub>soluțiebazică</sub> este densitatea acesteia și are valoarea 1.06 grame/cm<sup>3</sup></div>
    </div>
    <div class = "secondary_values">
        <div>c<sub>soluțiebazică</sub> = 0.931 calorii/grame * grad</div>
    </div>
</details>

<details>
    <summary><strong>Numărul de echivalenți</strong></summary>
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
</details>

<details>
    <summary><strong>Temperatura inițială și finală</strong></summary>
    <div class = "initial_values">
        <div>t<sub>inițială</sub> = 25 °C și reprezintă temperatura inițială a soluțiilor</div>
        <div>t<sub>finală</sub> = temperatura măsurată după amestecarea soluțiilor</div>
    </div>
</details>



<div>
  <table>
    <thead>
      <tr>
        <th>Reacția studiată</th>
        <th>V<sub>soluțieacidă</sub><br />(mL)</th>
        <th>t<sub>inițială</sub><br />(°C)</th>
        <th>t<sub>finală</sub><br />(°C)</th>
        <th class="has-tooltip">
            &Delta;t<br />(°C)
            <div class="tooltip">
             <strong>Variația de temperatură:</strong><br/>
             &Delta;t = t<sub>finală</sub> - t<sub>inițială</sub>
            </div>
        </th>
        <th class="has-tooltip">
            Q<br />(cal)
            <div class="tooltip">
                <strong>Căldura transferată:</strong><br/>
                Q = (C<sub>calorimetru</sub> + m<sub>soluțieacidă</sub> * c<sub>soluțieacida</sub> + m<sub>soluțiebazică</sub>*c<sub>soluțiebazică</sub>) * &Delta;t<br/>
            </div>
        </th>
        <th class="has-tooltip">
            &Delta;H<br />(cal/echiv)
            <div class="tooltip">
                <strong>Entalpia de neutralizare:</strong><br/>
                &Delta;H = -Q / n<br/>
                <small>n = (V<sub>acid</sub> * N<sub>acid</sub>) / 1000 sau</small><br/>
                <small>n = (V<sub>bază</sub> * N<sub>bază</sub>) / 1000</small><br/>
            </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>HCl + NaOH &rarr; NaCl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid1} /></td><td><input type="number" bind:value={Tinițial1}/></td><td><input type="number" bind:value={Tfinal1}/></td><td>{Tfinal1 - Tinițial1}</td><td>{((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - Tinițial1)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid1 * 1.06 * 0.931 + 2 * Vacid1 * 1.06 * 0.931) * (Tfinal1 - Tinițial1)) / (Vacid1 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>H<sub>2</sub>SO<sub>4</sub> + 2NaOH &rarr; Na<sub>2</sub>SO<sub>4</sub> + 2H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid2} /></td><td><input type="number" bind:value={Tinițial2}/></td><td><input type="number" bind:value={Tfinal2}/></td><td>{Tfinal2 - Tinițial2}</td><td>{((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - Tinițial2)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid2 * 1.06 * 0.931 + 2 * Vacid2 * 1.06 * 0.931) * (Tfinal2 - Tinițial2)) / (Vacid2 / 1000)).toFixed(3)}</td>
      </tr>
      <tr>
        <td>HCl + NH<sub>4</sub>OH &rarr; NH<sub>4</sub>Cl + H<sub>2</sub>O</td>
        <td><input type="number" bind:value={Vacid3} /></td><td><input type="number" bind:value={Tinițial3}/></td><td><input type="number" bind:value={Tfinal3}/></td><td>{Tfinal3 - Tinițial3}</td><td>{((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - Tinițial3)).toFixed(3)}</td><td>{(-1 * ((20 + Vacid3 * 1.06 * 0.931 + 2 * Vacid3 * 1.06 * 0.931) * (Tfinal3 - Tinițial3)) / (Vacid3 / 1000)).toFixed(3)}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
    details
    {
        margin-bottom: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        background-color: #fafafa;
        overflow: hidden;
    }
    summary
    {
        padding: 12px 15px;
        font-weight: bold;
        cursor: pointer;
        background-color: #f1f3f5;
        list-style: none; /* Elimină săgeata standard */
        display: flex;
        align-items: center;
    }
    details[open] summary
    {
        background-color: #07e576;
        border-bottom: 1px solid #ddd;
    }
    
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
    .has-tooltip
    {
        position: relative; /* Esențial pentru ca tooltip-ul să știe unde să apară */
        cursor: help; /* Schimbă cursorul într-un semn de întrebare */
        text-decoration: underline dotted #666; /* Un indiciu vizual că poți face hover */
    }
    .tooltip 
    {
        visibility: hidden;
        background-color: #2c3e50;
        color: #ecf0f1;
        text-align: left;
        padding: 12px;
        border-radius: 6px;
        
        /* Poziționare deasupra elementului */
        position: absolute;
        z-index: 10;
        bottom: 125%; 
        right:0%;
        /*transform: translateX(-50%); /* Centrează cutia */
        
        /* Efect de apariție (fade-in) */
        opacity: 0;
        transition: opacity 0.3s, visibility 0.3s;
        
        /* Dimensiuni și text */
        width: max-content;
        max-width: 1000px;
        font-weight: normal;
        font-size: 0.9rem;
        line-height: 1.4;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
  /* Săgeata mică de sub tooltip */
    .tooltip::after
    {
        content: "";
        position: absolute;
        top: 100%;
        right: 10%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #2c3e50 transparent transparent transparent;
    }
  /* Arată tooltip-ul când pui mouse-ul pe <th> */
    .has-tooltip:hover .tooltip
    {
        visibility: visible;
        opacity: 1;
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