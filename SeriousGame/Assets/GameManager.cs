using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System.Collections;
using UnityEngine.Networking;
using static System.Net.Mime.MediaTypeNames;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;
    

    [Header("UI References")]
    public TMP_Text dialogueText;
    public GameObject menuOpciones;
    public Button boton1;
    public Button boton2;
    public UnityEngine.UI.Image imagenDescripcion;

    private UserFullInfo userInfo;
    private int descripcionActual = 0;
    private int tratamientoActual = 0;

    private bool esperandoClick = false;
    private bool haClicado = false;

    private AnimalesePlayer voice;
    private int MAX_LINEAS_VISIBLES = 6;
    public RawImage continueIcon;

    private void Awake()
    {
        if (Instance == null)
        {
            voice = FindObjectOfType<AnimalesePlayer>();
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Update()
    {
        if (esperandoClick && Input.GetMouseButtonDown(0))
        {
            haClicado = true;
        }
    }

    public void SetUserInfo(UserFullInfo info)
    {
        userInfo = info;
        MostrarSaludoInicial();
    }

    private void MostrarSaludoInicial()
    {
        dialogueText.text = $"Hola {userInfo.name}. ¿Qué quieres saber?";
        StopAllCoroutines();
       
        menuOpciones.SetActive(true);

        ConfigurarBoton(boton1, $"Explicar {userInfo.disease}", ExplicarEnfermedad);
        ConfigurarBoton(boton2, "Explicar tratamientos", MostrarSelectorTratamientos);
    }

    private void ExplicarEnfermedad()
    {
        menuOpciones.SetActive(false);
        descripcionActual = 0;
        StartCoroutine(MostrarSiguienteDescripcion());
    }

    private IEnumerator MostrarSiguienteDescripcion()
    {
        string nodesc = "No hay descripciones disponibles";
        if (userInfo.descripciones == null || userInfo.descripciones.Length == 0)
        {
            dialogueText.text =nodesc;
            voice.PlayText(nodesc);
            yield break;
        }

        while (descripcionActual < userInfo.descripciones.Length)
        {
            var desc = userInfo.descripciones[descripcionActual];

            if (!string.IsNullOrEmpty(desc.image))
            {
                imagenDescripcion.gameObject.SetActive(true);
                yield return StartCoroutine(CargarImagenDesdeURL(desc.image));
                yield return StartCoroutine(FadeImage(1f));
            }
            else
            {
                yield return StartCoroutine(FadeImage(0f));
            }

            yield return StartCoroutine(EscribirTexto(desc.descripcion));
          

            descripcionActual++;
        }



        yield return StartCoroutine(FadeImage(0f)); // Ocultar imagen al final
        MostrarOpcionesTrasEnfermedad();
    }
    private IEnumerator EsperarClickUsuario()
    {
        MostrarContinueIcon();
        haClicado = false;
        esperandoClick = true;

        while (!haClicado)
            yield return null;

        esperandoClick = false;
        OcultarContinueIcon();
    }



    private IEnumerator FadeImage(float targetAlpha, float duration = 0.4f)
    {
        Color color = imagenDescripcion.color;
        float startAlpha = color.a;
        float t = 0f;

        while (t < 1f)
        {
            t += Time.deltaTime / duration;
            color.a = Mathf.Lerp(startAlpha, targetAlpha, t);
            imagenDescripcion.color = color;
            yield return null;
        }

        color.a = targetAlpha;
        imagenDescripcion.color = color;
    }

    private void MostrarOpcionesTrasEnfermedad()
    {
        string text = "¿Quieres repetir la explicación o saber sobre los tratamientos?";
        StopAllCoroutines();
        StartCoroutine(EscribirTexto(text));
        
        menuOpciones.SetActive(true);

        ConfigurarBoton(boton1, "Repetir enfermedad", ExplicarEnfermedad);
        ConfigurarBoton(boton2, "Ver tratamientos", MostrarSelectorTratamientos);
    }

    private void MostrarSelectorTratamientos()
    {
        if (userInfo.tratamientos == null || userInfo.tratamientos.Length == 0)
        {
            StartCoroutine(EscribirTexto("No tienes tratamientos asignados."));

            menuOpciones.SetActive(false);
            return;
        }

        tratamientoActual = 0;
        MostrarTratamiento(tratamientoActual);
    }

    private void MostrarTratamiento(int index)
    {
        menuOpciones.SetActive(false);
        StopAllCoroutines();
        StartCoroutine(MostrarTratamiento(userInfo.tratamientos[index]));
    }
    private void MostrarOpcionesTrasTratamiento()
    {
        StopAllCoroutines();
        StartCoroutine("¿Qué quieres hacer ahora?");
        menuOpciones.SetActive(true);

        ConfigurarBoton(boton1, "Repetir tratamiento", () => MostrarTratamiento(tratamientoActual));
        ConfigurarBoton(boton2, "Otro tratamiento", () =>
        {
            tratamientoActual = (tratamientoActual + 1) % userInfo.tratamientos.Length;
            MostrarTratamiento(tratamientoActual);
        });
    }

    private IEnumerator MostrarTratamiento(Treatment tratamiento)
    {
        yield return StartCoroutine(FadeImage(0f));

        string info = $"Tratamiento: {tratamiento.name}\nBeneficios: {tratamiento.benefits}\nRiesgos: {tratamiento.risks}";
        
        yield return StartCoroutine(EscribirTexto(info));
       

        if (tratamiento.tdescriptions != null)
        {
            foreach (var desc in tratamiento.tdescriptions)
            {
                if (!string.IsNullOrEmpty(desc.image))
                {
                    yield return StartCoroutine(CargarImagenDesdeURL(desc.image));
                    yield return StartCoroutine(FadeImage(1f));
                }
                else
                {
                    yield return StartCoroutine(FadeImage(0f));
                }

                yield return StartCoroutine(EscribirTexto(desc.descripcion));
          
            }
        }

        yield return StartCoroutine(FadeImage(0f));
        MostrarOpcionesTrasTratamiento();
    }

    public IEnumerator EscribirTexto(string texto, float velocidad = 0.03f)
    {
        int index = 0;
        OcultarContinueIcon();
        
        voice.PlayText(texto);

        while (index < texto.Length)
        {
            dialogueText.text = "";
            string lineaActual = "";
            int ultimoEspacio = -1;
            int inicioLinea = index;

            while (index < texto.Length)
            {
                char c = texto[index];
                lineaActual += c;
                dialogueText.text = lineaActual;
                dialogueText.ForceMeshUpdate();
                yield return new WaitForSeconds(velocidad);

                // Guarda el índice del último espacio por si hay que hacer rollback
                if (char.IsWhiteSpace(c))
                {
                    ultimoEspacio = index;
                }

                if (dialogueText.textInfo.lineCount > MAX_LINEAS_VISIBLES)
                {
                    if (ultimoEspacio > inicioLinea)
                    {
                        index = ultimoEspacio + 1;
                    }
                    // NO avances en el else, solo rompe y deja que el bucle exterior lo controle

                    break;

                }
                
                index++;
            }

          
        }
        yield return StartCoroutine(EsperarClickUsuario());
        OcultarContinueIcon();
        dialogueText.text = "";
    }



    private IEnumerator CargarImagenDesdeURL(string url)
    {
        //  1. Fade out antes de cambiar
        yield return StartCoroutine(FadeImage(0f, 0.3f));

        using (UnityWebRequest www = UnityWebRequestTexture.GetTexture(url))
        {
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.Success)
            {
                Texture2D textura = DownloadHandlerTexture.GetContent(www);
                imagenDescripcion.sprite = Sprite.Create(textura, new Rect(0, 0, textura.width, textura.height), new Vector2(0.5f, 0.5f));

                //  2. Fade in tras asignar nueva imagen
                yield return StartCoroutine(FadeImage(1f, 0.4f));
            }
            else
            {
                Debug.LogWarning("Error al cargar imagen: " + www.error);
                yield return StartCoroutine(FadeImage(0f, 0.3f));
            }
        }
    }


    private void ConfigurarBoton(Button boton, string texto, UnityEngine.Events.UnityAction accion)
    {
        boton.gameObject.SetActive(true);
        TMP_Text label = boton.GetComponentInChildren<TMP_Text>();
        if (label != null) label.text = texto;

        boton.onClick.RemoveAllListeners();
        boton.onClick.AddListener(() =>
        {
            UnityEngine.EventSystems.EventSystem.current.SetSelectedGameObject(null);
            accion.Invoke();
        });
    }
    private IEnumerator MostrarContinueIcon()
    {
        Color c = continueIcon.color;
        c.a = 0;
        continueIcon.color = c;
        continueIcon.gameObject.SetActive(true);

        float t = 0f;
        while (t < 1f)
        {
            t += Time.deltaTime / 0.4f;
            c.a = Mathf.Lerp(0, 1, t);
            continueIcon.color = c;
            yield return null;
        }
    }
    private void OcultarContinueIcon()
    {
        continueIcon.gameObject.SetActive(false);
    }

}

