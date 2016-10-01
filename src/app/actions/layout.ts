import { Action } from '@ngrx/store';

export const LayoutActionTypes = {
  OPEN_SIDENAV: '[Layout] Open Sidenav',
  CLOSE_SIDENAV: '[Layout] Close Sidenav'
};

export class OpenSidenavAction implements Action {
  type = LayoutActionTypes.OPEN_SIDENAV;
}

export class CloseSidenavAction implements Action {
  type = LayoutActionTypes.CLOSE_SIDENAV;
}

export type LayoutActions = OpenSidenavAction
  | CloseSidenavAction;
