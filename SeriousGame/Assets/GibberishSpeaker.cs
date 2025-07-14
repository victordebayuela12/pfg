using UnityEngine;

public class GibberishSpeaker : MonoBehaviour
{
    public AudioSource audioSource;
    public AudioClip[] clips;

    public void PlayGibberish()
    {
        if (clips.Length > 0)
        {
            int index = Random.Range(0, clips.Length);
            audioSource.pitch = Random.Range(0.8f, 1.2f);
            audioSource.PlayOneShot(clips[index]);
        }
    }
}
