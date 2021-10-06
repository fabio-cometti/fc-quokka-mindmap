import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * Service for managing PWA events
 */
@Injectable({
  providedIn: 'root'
})
export class PwaService {

  /**
   * Event generated when a PWA install prompt display to the user
   */
  promptEvent : any; 

  /**
   * Default constructor
   * @param swUpdate
   */
  constructor(private swUpdate: SwUpdate) {
    swUpdate.available.subscribe(event => {
      if (this.askUserToUpdate()) {
        window.location.reload(); //Reload the application with an updated version
      }
    });

    window.addEventListener('beforeinstallprompt', event => {
      this.promptEvent = event;
    });
  }

  /**
   * Display a confirm to the user for asking to reload the application
   * @returns true if user confirm to reload the application 
   */
  askUserToUpdate(): boolean {
    return window.confirm('Aggiornare l\'applicazione?');
  } 
}
