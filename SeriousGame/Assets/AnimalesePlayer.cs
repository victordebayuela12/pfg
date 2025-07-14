using UnityEngine;
using System.Collections.Generic;
using System.Collections;

public class AnimalesePlayer : MonoBehaviour
{
    public AudioSource audioSource;
    public string pitch = "med"; // puede ser "high", "med", "low"
    public float basePitchShift = 2.3f;
    public float randomFactor = 0.35f;
    public Animator personajeAnimator;
    private readonly string[] keys = {
        "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p",
        "q","r","s","t","u","v","w","x","y","z","th","sh"," ","."
    };
    private Dictionary<string, AudioClip> soundMap = new();

    void Start()
    {
        LoadClips();
    }

    void LoadClips()
    {
        for (int i = 0; i < keys.Length; i++)
        {
            string num = (i + 1).ToString("D2");
            string path = $"Sounds/Animalese/{pitch}/sound{num}";
            AudioClip clip = Resources.Load<AudioClip>(path);
            if (clip != null)
                soundMap[keys[i]] = clip;
        }
    }

    public void PlayText(string input)
    {
        StopAllCoroutines();
        StartCoroutine(PlayLetters(input.ToLower()));
    }

    IEnumerator PlayLetters(string input)
    {
        List<AudioClip> queue = new();
        personajeAnimator.SetBool("Talking", true);
        for (int i = 0; i < input.Length; i++)
        {
            string c = input[i].ToString();

            if (i < input.Length - 1 && c == "s" && input[i + 1] == 'h')
            {
                queue.Add(soundMap["sh"]);
                i++;
            }
            else if (i < input.Length - 1 && c == "t" && input[i + 1] == 'h')
            {
                queue.Add(soundMap["th"]);
                i++;
            }
            else if (i > 0 && input[i] == input[i - 1])
            {
                continue; // skip repeat letters
            }
            else if (c == "," || c == "?")
            {
                queue.Add(soundMap["."]);
            }
            else if (soundMap.ContainsKey(c))
            {
                queue.Add(soundMap[c]);
            }
        }

        foreach (AudioClip clip in queue)
        {
            audioSource.pitch = basePitchShift + Random.Range(0f, randomFactor);
            audioSource.PlayOneShot(clip);
            yield return new WaitForSeconds(clip.length / audioSource.pitch);
        }
        personajeAnimator.SetBool("Talking", false);
    }
  
}
