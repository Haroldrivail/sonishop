<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Tests\CreatesApplication;

abstract class TestCase extends BaseTestCase
{
    // Uses the local Tests\CreatesApplication trait (loads app) giving us HTTP helpers from BaseTestCase
    use CreatesApplication;
}
