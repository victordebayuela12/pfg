export function contarSilabas(palabra) {
  palabra = palabra.toLowerCase().replace(/[^a-záéíóúüñ]/g, "");
  const vocales = "aeiouáéíóúü";
  let contador = 0;

  for (let i = 0; i < palabra.length; i++) {
    if (vocales.includes(palabra[i])) {
      if (i === 0 || !vocales.includes(palabra[i - 1])) {
        contador++;
      }
    }
  }

  return Math.max(1, contador);
}

export function calcularINFZ(texto) {
  if (!texto || texto.trim().length === 0) return 0;

  const frases = texto.split(/[.!?¡¿;:]+/).filter(f => f.trim().length > 0);
  const palabras = texto.split(/\s+/).filter(w => w.trim().length > 0);
  const silabas = palabras.reduce((total, palabra) => total + contarSilabas(palabra), 0);

  const numFrases = frases.length || 1;
  const numPalabras = palabras.length || 1;
  const numSilabas = silabas || 1;

  const indice =
    206.835 - (62.3 * (numSilabas / numPalabras)) - (numPalabras / numFrases);

  return Math.round(indice * 100) / 100;
}
