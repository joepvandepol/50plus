import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AppState } from "../../../reducers/index";
import { Store, select } from "@ngrx/store";
import * as actions from "./../../store/auth.actions";
import { getError } from "../../store/auth.selectors";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppComponent } from "../../../../app/app.component";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";

export interface User {
  userName: string;
  email: string;
  letters: [{}];
}

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  error$: Observable<string | null>;

  itemCol: AngularFirestoreDocument<User>;
  db: AngularFirestore;

  constructor(
    private store: Store<AppState>,
    private appComponent: AppComponent,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.appComponent.logginIn(true);
    this.db = firestore;
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      username: new FormControl(),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.error$ = this.store.pipe(
      select(getError),
      map((error: any) => {
        if (error) {
          if (error.code === "auth/weak-password") {
            return error.message;
          } else if (error.code === "auth/email-already-in-use") {
            return "User with this email address already exist";
          }
        } else {
          return null;
        }
      })
    );
  }

  get email() {
    return this.registerForm.get("email");
  }
  get password() {
    return this.registerForm.get("password");
  }

  onRegister() {
    const username = this.registerForm.value.username;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    if (this.registerForm.valid) {
      // create user doc
      const data: User = { userName: username, email: email, letters: [{}] };

      this.store.dispatch(
        new actions.RegisterRequested({ username, email, password })
      );
    }
  }
}
