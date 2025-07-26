const apiUrl = "https://mindicador.cl/api/";
const conversor = document.querySelector("#conversor");

async function getTiposDeCambio() {
    try {
        const res = await fetch(apiUrl);
        const tiposDeCambio = await res.json();
        return tiposDeCambio;    
    }
    catch (error){
        alert("No se pudo conectar a la API. Cargando datos locales, por favor espere.");
        try {
            const res = await fetch('./assets/json/mindicador.json');
            const tiposDeCambio = await res.json()
            return tiposDeCambio;
        }
        catch (error) {
            alert("No se pudieron obtener los dato");
            return null;
        }
    }
};
async function renderSelect() {
    const tiposDeCambio = await getTiposDeCambio();
    tiposDeCambioAll = tiposDeCambio;
    let template = "";
    for(const tipoDeCambio in tiposDeCambio) {
        if(tiposDeCambio[tipoDeCambio] && tiposDeCambio[tipoDeCambio].nombre) {
            template += `
            <option value="${tipoDeCambio}">${tiposDeCambio[tipoDeCambio].nombre}</option>
            `
        }
    };
    conversor.innerHTML = template;
}



const montoInput = document.querySelector("#ingreseMonto");
const calcularBtn = document.querySelector("#calcular");
const resultado = document.querySelector("#resultado");
let tiposDeCambioAll = {};

calcularBtn.addEventListener("click", () => {
    const monto = parseFloat(montoInput.value);
    const tipoCambioSelect = conversor.value;
    const tipoCambio = tiposDeCambioAll[tipoCambioSelect];
    const conversionResultado = monto / tipoCambio.valor;

    if (isNaN(monto) || monto <= 0) {
        alert("Ingresa un monto válido.");
        return;
    }
    resultado.innerText = `Resultado: ${conversionResultado.toFixed(2)} ${tipoCambio.nombre}`;
    crearGrafico(tipoCambioSelect);
})


let myChart;
async function crearGrafico(moneda) {
    try {
        const res = await fetch(`${apiUrl}${moneda}`);
        const data = await res.json();
        const ultimos10 = data.serie.slice(0, 10).reverse();
        const labels = ultimos10.map(d => new Date(d.fecha).toLocaleDateString("es-CL"));
        const valores = ultimos10.map(d => d.valor);


        if (myChart) myChart.destroy();
        const canvas = document.getElementById("myChart");

        myChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: `Últimos 10 días ${data.nombre}`,
                    data: valores,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                }]
            }
        })
    } catch(error) {
        alert("No se pudo cargar el gráfico. Por favor, intenta nuevamente")
    }
    
};

renderSelect();


