import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { GeolocationService } from '../../shared/geolocation/geolocation.service';
import { Router } from '@angular/router';
import { GmapsGeocoderService } from '../../shared/gmaps-geocoder/gmaps-geocoder.service';
import { Position } from '../../../models/position.model';
import { MdDialog } from '@angular/material';
import { DialogComponent } from '../../shared/dialog/dialog.component';
import { WindowRefService } from 'app/shelters/window-ref.services';
import GeocoderResult = google.maps.GeocoderResult;

@Component({
  templateUrl: './search-by-address.component.html',
  styleUrls: ['./search-by-address.component.scss'],
  selector: 'hs-search-by-address',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchByAddressComponent implements OnInit, OnDestroy {
  @Input() public disabled: boolean;
  @Input() public placeholder: string;
  @Input() public searchQuery: string;

  @ViewChild('search') public searchElemRef: ElementRef;
  public showBouncer: boolean;
  public showSearchBar: boolean;

  private gmapsGeocoder: any;
  private autocomplete: any;
  private autocompleteListener: any;
  private geoLocation: GeolocationService;

  constructor(
    private router: Router,
    private zone: NgZone,
    private gmapsGeocoderService: GmapsGeocoderService,
    private dialog: MdDialog,
    private windowRefService: WindowRefService,
  ) {
    this.gmapsGeocoder = new windowRefService.nativeWindow.google.maps.Geocoder();
    this.geoLocation = new GeolocationService();
  }

  public ngOnInit() {
    this.autocomplete = new this.windowRefService.nativeWindow
      .google.maps.places.Autocomplete(this.searchElemRef.nativeElement, {
        types: ['address'],
        componentRestrictions: {
          country: 'se'
        }
    });

    this.autocompleteListener = this.autocomplete
      .addListener('place_changed', () => this.chooseAddress(this.autocomplete.getPlace()));
/*
    if (this.router.url === '/skyddsrum') {
      this.displaySearchBar();
      this.displayBouncer(true);
      this.geoLocation.getLocation().first().subscribe(
        (pos: any) => {
          this.displayBouncer(false);
          this.lookupPosition(<Position> {
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          });
        },
        () => this.displayBouncer(false),
        () => this.displayBouncer(false)
      );
    }
    */
  }

  public toggleSearchBar() {
    this.showSearchBar = !this.showSearchBar;
  }

  public chooseAddress(address: any) {
    if (!address.geometry) {
      return this.dialog.open(DialogComponent, {
        data: { header: 'Adressen kunde inte hittas', message: 'Välj en adress från förslagen.' }
      });
    }

    this.searchQuery = address.formatted_address;
    this.displayBouncer(true);

    this.router
      .navigate([
        '/skyddsrum/koordinater',
        address.geometry.location.lat(), address.geometry.location.lng()
      ])
      .then(() => this.displayBouncer(false))
      .catch(() => this.displayBouncer(false));
  }

  public ngOnDestroy(): void {
    this.windowRefService.nativeWindow.google.maps.event.clearInstanceListeners(this.autocomplete);
    this.windowRefService.nativeWindow.google.maps.event.removeListener(this.autocompleteListener);
  }

  private displaySearchBar() {
    this.showSearchBar = true;
  }
/*
  private lookupPosition(position: Position) {
    this.zone.run(() => this.displayBouncer(true));

    this.gmapsGeocoderService.lookupPosition(position).subscribe(
      (results: GeocoderResult[]) => {

        if (results.length > 0) {
          this.searchQuery = results[0].formatted_address;

          setTimeout(() => {
            this.windowRefService.nativeWindow.
              google.maps.event.trigger(this.searchElemRef.nativeElement, 'focus', {});
            this.searchElemRef.nativeElement.focus();
          }, 60);
          this.displayBouncer(false);
        }
      },
      () => this.displayBouncer(false),
      () => this.displayBouncer(false),
    );
  }
*/
  private displayBouncer(value: boolean) {
    this.showBouncer = value;
  }
}
