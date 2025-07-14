using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class DialogueUI : MonoBehaviour
{
    public GameObject menuOpciones;
    public Button boton1;
    public Button boton2;
    public TMP_Text dialogueText;

    private Action opcion1Callback;
    private Action opcion2Callback;

    void Start()
    {
        menuOpciones.SetActive(false);
        dialogueText.text = "";

        boton1.onClick.AddListener(() => {
            menuOpciones.SetActive(false);
            opcion1Callback?.Invoke();
        });

        boton2.onClick.AddListener(() => {
            menuOpciones.SetActive(false);
            opcion2Callback?.Invoke();
        });
    }

    public void MostrarDialogo(string texto)
    {
        dialogueText.text = texto;
    }

    public void MostrarOpciones(string textoBoton1, Action callback1, string textoBoton2, Action callback2)
    {
        boton1.GetComponentInChildren<TMP_Text>().text = textoBoton1;
        boton2.GetComponentInChildren<TMP_Text>().text = textoBoton2;

        opcion1Callback = callback1;
        opcion2Callback = callback2;

        menuOpciones.SetActive(true);
    }
}
