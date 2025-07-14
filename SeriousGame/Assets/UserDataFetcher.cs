using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class UserDataFetcher : MonoBehaviour
{
    private string token;
    private string id;
    private bool tokenAsignado = false;

    private string apiUrl = "http://localhost:5000/api/patients/fullinfo/";

    private UserFullInfo datosPaciente;
    public System.Action onDataFetched;

    /// <summary>
    /// Recibe token y userId desde la web, separados por una barra "|"
    /// </summary>
    public void SetTokenAndId(string payload)
    {
        string[] parts = payload.Split('|');
        if (parts.Length != 2)
        {
            Debug.LogError(" Formato incorrecto del payload recibido en Unity.");
            return;
        }

        string t = parts[0];
        string userId = parts[1];

        if (tokenAsignado || string.IsNullOrEmpty(t) || string.IsNullOrEmpty(userId))
        {
            Debug.LogWarning("Token o ID vacío o ya asignado.");
            return;
        }

        tokenAsignado = true;
        token = t.StartsWith("Bearer ") ? t : "Bearer " + t;
        id = userId;

        Debug.Log(" Token e ID recibidos en Unity:");
        Debug.Log("Token: " + token);
        Debug.Log(" ID: " + id);

        StartCoroutine(GetUserInfo());
    }

    IEnumerator GetUserInfo()
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(id))
        {
            Debug.LogError(" Token o ID no están definidos para hacer la petición.");
            yield break;
        }

        string url = apiUrl + id;
        Debug.Log(" Haciendo petición a: " + url);

        UnityWebRequest request = UnityWebRequest.Get(url);
        request.SetRequestHeader("Authorization", token);

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            string json = request.downloadHandler.text;
            Debug.Log("📥 Datos recibidos del servidor:");
            Debug.Log(json);

            datosPaciente = JsonUtility.FromJson<UserFullInfo>(json);
            if (datosPaciente != null)
            {
                onDataFetched?.Invoke();
                Debug.Log("✔️ Llamando a SetUserInfo con: " + datosPaciente.name);

                if (GameManager.Instance != null)
                {
                    Debug.Log("✔️ Llamando a SetUserInfo con: " + datosPaciente.name);

                    GameManager.Instance.SetUserInfo(datosPaciente);
                }
            }
            else
            {
                Debug.LogError(" Error al parsear los datos del paciente.");
            }
        }
        else
        {
            Debug.LogError(" Error al obtener datos del servidor: " + request.error);
            Debug.LogError(" Respuesta del servidor: " + request.downloadHandler.text);
        }
    }

    public UserFullInfo GetDatosPaciente()
    {
        return datosPaciente;
    }
}

[System.Serializable]
public class Descripcion
{
    public string descripcion;
    public string image;
}

[System.Serializable]
public class Treatment
{
    public string name;
    public string benefits;
    public string risks;
    public Descripcion[] tdescriptions;
}

[System.Serializable]
public class UserFullInfo
{
    public string name;
    public string disease;
    public string resumen;
    public Descripcion[] descripciones;
    public Treatment[] tratamientos;
}


/*
public class UserDataFetcher : MonoBehaviour
{

    void Start()
    {
        // Creamos los datos simulados
        UserFullInfo info = new UserFullInfo();
        info.name = "Paciente Demo";
        info.disease = "Asma";
        info.resumen = "El asma es una enfermedad respiratoria crónica que inflama y estrecha los pulmones.";

        info.descripciones = new Descripcion[]
        {
            new Descripcion { texto = "Produce dificultad para respirar, tos y opresión en el pecho.", imagen = "" },
            new Descripcion { texto = "Suele tratarse con medicación diaria y evitando desencadenantes.", imagen = "" }
        };

        info.tratamientos = new Treatment[]
        {
            new Treatment { name = "Inhalador broncodilatador", benefits = "Alivia síntomas de forma rápida.", risks = "Sequedad bucal, nerviosismo." },
            new Treatment { name = "Corticoides inhalados", benefits = "Disminuyen la inflamación a largo plazo.", risks = "Irritación de garganta." }
        };

        // Pasamos los datos al GameManager
        GameManager.Instance.SetUserInfo(info);
    }
}

[System.Serializable]
public class Descripcion
{
    public string texto;
    public string imagen;
}

[System.Serializable]
public class Treatment
{
    public string name;
    public string benefits;
    public string risks;
    public Descripcion[] descriptions;
}

[System.Serializable]
public class UserFullInfo
{
    public string name;
    public string disease;
    public string resumen;
    public Descripcion[] descripciones;
    public Treatment[] tratamientos;
}
*/